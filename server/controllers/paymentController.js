const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db: firestore, admin } = require('../config/firebase');

const paymentsRef = firestore.collection('payments');
const usersRef = firestore.collection('users');
const plansRef = firestore.collection('plans');
const businessesRef = firestore.collection('businesses');

exports.createCheckoutSession = async (req, res) => {
    try {
        const { packageId, amount, type, businessId, planId, metadata } = req.body;
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'User not authenticated' });
        const userId = req.user.id.toString();

        if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is missing');
        if (!amount || !type) return res.status(400).json({ error: 'Missing required fields' });

        const newRef = paymentsRef.doc();
        const transactionId = newRef.id;

        await newRef.set({
            id: transactionId,
            user_id: userId,
            business_id: businessId ? businessId.toString() : null,
            type: type,
            amount: parseFloat(amount),
            status: 'PENDING',
            metadata: metadata || {},
            created_at: new Date().toISOString()
        });

        const domain = process.env.BASE_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'promptpay'],
            line_items: [{
                price_data: {
                    currency: 'thb',
                    product_data: {
                        name: type === 'AD_PURCHASE' ? 'Advertising Package' : (type === 'PLAN_PURCHASE' ? 'Premium Plan' : 'Wallet Top-up'),
                        description: `Transaction ID: ${transactionId}`,
                    },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${domain}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/payment/cancel`,
            metadata: {
                transactionId: transactionId,
                userId: userId,
                type: type,
                businessId: businessId ? businessId.toString() : '',
                planId: planId ? planId.toString() : '',
            }
        });

        await newRef.update({ stripe_session_id: session.id });
        res.json({ url: session.url });

    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const snapshot = await plansRef.where('is_active', '==', true).orderBy('price', 'asc').get();
        
        // Mock fallback if collection is empty
        if (snapshot.empty) {
            return res.json({
                success: true,
                plans: [
                    { id: '1', name: 'Pro Plan', price: 99, duration_days: 30, is_active: true },
                    { id: '2', name: 'Yearly Plan', price: 990, duration_days: 365, is_active: true }
                ]
            });
        }
        
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, plans });
    } catch (error) {
        console.error('Get Plans Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch plans' });
    }
};

exports.getMyTransactions = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const snapshot = await paymentsRef.where('user_id', '==', req.user.id.toString())
                                          .orderBy('created_at', 'desc')
                                          .get();

        const transactions = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            if (data.metadata && data.metadata.planId) {
                const planDoc = await plansRef.doc(data.metadata.planId).get();
                if (planDoc.exists) data.plan = { id: planDoc.id, ...planDoc.data() };
            }
            return data;
        }));

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
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const metadata = session.metadata;
        const transactionId = metadata.transactionId;

        console.log(`Payment Success for Transaction: ${transactionId}`);

        try {
            await firestore.runTransaction(async (t) => {
                const transRef = paymentsRef.doc(transactionId);
                const transDoc = await t.get(transRef);

                if (!transDoc.exists) throw new Error('Transaction not found');
                const transData = transDoc.data();
                if (transData.status === 'SUCCESS') return;

                t.update(transRef, { status: 'SUCCESS', receipt_url: session.url });

                if (metadata.type === 'AD_PURCHASE' && metadata.businessId) {
                    const busRef = businessesRef.doc(metadata.businessId);
                    const busDoc = await t.get(busRef);
                    if (busDoc.exists) {
                        const now = new Date();
                        let currentExpiry = busDoc.data().ads_expiry ? new Date(busDoc.data().ads_expiry) : now;
                        if (currentExpiry < now) currentExpiry = now;
                        
                        const newExpiry = new Date(currentExpiry.getTime() + (30 * 24 * 60 * 60 * 1000));
                        t.update(busRef, { ads_expiry: newExpiry.toISOString(), last_payment_id: transactionId });
                    }
                } else if (metadata.type === 'WALLET_TOPUP') {
                    const userRef = usersRef.doc(metadata.userId);
                    const userDoc = await t.get(userRef);
                    if (userDoc.exists) {
                        t.update(userRef, { wallet_balance: admin.firestore.FieldValue.increment(transData.amount) });
                    }
                } else if (metadata.type === 'PLAN_PURCHASE') {
                    const userRef = usersRef.doc(metadata.userId);
                    const userDoc = await t.get(userRef);
                    
                    const planDoc = await plansRef.doc(metadata.planId).get();
                    const durationDays = planDoc.exists ? planDoc.data().duration_days : 30; // fallback

                    if (userDoc.exists) {
                        const now = new Date();
                        const userData = userDoc.data();
                        
                        let currentExpiry = userData.premium_expiry ? new Date(userData.premium_expiry) : now;
                        if (currentExpiry < now) currentExpiry = now;

                        const newExpiry = new Date(currentExpiry.getTime() + (durationDays * 24 * 60 * 60 * 1000));
                        
                        let newStartDate = userData.premium_start_date;
                        if (!userData.plan_type || userData.plan_type === 'free' || (userData.premium_expiry && new Date(userData.premium_expiry) < now)) {
                            newStartDate = now.toISOString();
                        }

                        t.update(userRef, {
                            plan_type: 'premium',
                            premium_start_date: newStartDate || now.toISOString(),
                            premium_expiry: newExpiry.toISOString()
                        });
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
