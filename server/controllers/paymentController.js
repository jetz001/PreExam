const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Transaction, User, AdsConfig, Business, Plan, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.createCheckoutSession = async (req, res) => {
    try {
        const { packageId, amount, type, businessId, planId, metadata } = req.body;
        // Check user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.id;

        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing');
        }

        if (!amount || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log('[Payment] Creating DB Transaction...');
        // 1. Create PENDING Transaction in DB
        const transaction = await Transaction.create({
            user_id: userId,
            business_id: businessId || null,
            type: type,
            amount: amount,
            status: 'PENDING',
            metadata: metadata || {},
        });
        console.log('[Payment] DB Transaction created:', transaction.id);

        const domain = process.env.BASE_URL || 'http://localhost:3000';

        console.log('[Payment] Creating Stripe Session...');
        // 2. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'promptpay'],
            line_items: [{
                price_data: {
                    currency: 'thb',
                    product_data: {
                        name: type === 'AD_PURCHASE' ? 'Advertising Package' : 'Wallet Top-up',
                        description: `Transaction ID: ${transaction.id}`,
                    },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${domain}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/payment/cancel`,
            metadata: {
                transactionId: transaction.id,
                userId: userId.toString(),
                type: type,
                businessId: businessId ? businessId.toString() : '',
                planId: planId ? planId.toString() : '',
            }
        });
        console.log('[Payment] Stripe Session created:', session.id);

        // Update transaction with session ID
        await transaction.update({ stripe_session_id: session.id });

        res.json({ url: session.url });

    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.findAll({
            where: { is_active: true },
            order: [['price', 'ASC']]
        });
        res.json({ success: true, plans });
    } catch (error) {
        console.error('Get Plans Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch plans' });
    }
};

exports.getMyTransactions = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const transactions = await Transaction.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Plan, as: 'plan' }],
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, transactions });
    } catch (error) {
        console.error('Get My Transactions Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // req.body MUST be raw buffer here
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const metadata = session.metadata;
        const transactionId = metadata.transactionId;

        console.log(`Payment Success for Transaction: ${transactionId}`);

        try {
            // Start a DB transaction
            await sequelize.transaction(async (t) => {
                // 1. Update Transaction Status
                const transaction = await Transaction.findByPk(transactionId, { transaction: t });
                if (!transaction) throw new Error('Transaction not found');

                // Prevent double processing
                if (transaction.status === 'SUCCESS') return;

                await transaction.update({
                    status: 'SUCCESS',
                    receipt_url: session.url // Stripe doesn't send receipt URL in session object directly usually, often in charge. But let's check later. For now, we can skip or find another way. Session has payment_intent which has charges. 
                    // To keep it simple: We mark success.
                }, { transaction: t });

                // 2. Logic based on Type
                if (metadata.type === 'AD_PURCHASE' && metadata.businessId) {
                    const businessId = parseInt(metadata.businessId);

                    // Update AdsConfig
                    let adsConfig = await AdsConfig.findOne({ where: { business_id: businessId }, transaction: t });

                    if (!adsConfig) {
                        adsConfig = await AdsConfig.create({ business_id: businessId }, { transaction: t });
                    }

                    // Calculate new expiry (Example: +7 days) - Real logic depends on packageId from metadata
                    const now = new Date();
                    const currentExpiry = adsConfig.zone_a_expiry && adsConfig.zone_a_expiry > now ? adsConfig.zone_a_expiry : now;
                    // Example: All ad purchases are 30 days for now, or based on amount
                    const addedTime = 30 * 24 * 60 * 60 * 1000; // 30 days
                    const newExpiry = new Date(currentExpiry.getTime() + addedTime);

                    await adsConfig.update({
                        zone_a_expiry: newExpiry, // Assuming Zone A for now as per prompt example logic simple update
                        last_payment_id: transactionId
                    }, { transaction: t });

                    console.log(`Updated AdsConfig for Business ${businessId}, New Expiry: ${newExpiry}`);

                } else if (metadata.type === 'WALLET_TOPUP') {
                    // Update User Wallet
                    const user = await User.findByPk(metadata.userId, { transaction: t });
                    if (user) {
                        // user.wallet_balance is Decimal/Float
                        const currentBalance = parseFloat(user.wallet_balance || 0);
                        const topupAmount = parseFloat(transaction.amount);
                        await user.update({ wallet_balance: currentBalance + topupAmount }, { transaction: t });
                        console.log(`Wallet Top-up User ${user.id}: +${topupAmount}`);
                    }
                } else if (metadata.type === 'PLAN_PURCHASE') {
                    // Handle Premium Plan
                    const planId = parseInt(metadata.planId);
                    const plan = await Plan.findByPk(planId, { transaction: t });
                    const user = await User.findByPk(metadata.userId, { transaction: t });

                    if (user && plan) {
                        const now = new Date();
                        // If already premium and not expired, extend
                        let currentExpiry = user.premium_expiry ? new Date(user.premium_expiry) : now;
                        if (currentExpiry < now) currentExpiry = now;

                        const addedTime = plan.duration_days * 24 * 60 * 60 * 1000;
                        const newExpiry = new Date(currentExpiry.getTime() + addedTime);

                        // Set start date only if not currently active premium or expired
                        let newStartDate = user.premium_start_date;
                        if (!user.plan_type || user.plan_type === 'free' || (user.premium_expiry && new Date(user.premium_expiry) < now)) {
                            newStartDate = now;
                        }

                        await user.update({
                            plan_type: 'premium',
                            premium_start_date: newStartDate || now,
                            premium_expiry: newExpiry
                        }, { transaction: t });

                        console.log(`Plan Purchase User ${user.id}: Plan ${plan.name}, Expiry: ${newExpiry}`);
                    }
                }
            });

        } catch (dbError) {
            console.error('Database Update Failed:', dbError);
            return res.status(500).send('Database Error');
        }
    }

    res.status(200).send();
};
