const { db: firestore, admin } = require('../config/firebase');

const businessesRef = firestore.collection('businesses');

exports.createBusiness = async (req, res) => {
    try {
        const { name, tagline, category, contact_link, contact_line_id, contact_facebook_url } = req.body;
        const owner_uid = req.user.id.toString();

        const snapshot = await businessesRef.where('owner_uid', '==', owner_uid).get();
        if (!snapshot.empty) {
            return res.status(400).json({ success: false, message: 'User already has a business page.' });
        }

        const newDoc = businessesRef.doc();
        const businessData = {
            id: newDoc.id,
            owner_uid,
            name,
            tagline: tagline || null,
            category: category || null,
            contact_link: contact_link || null,
            contact_line_id: contact_line_id || null,
            contact_facebook_url: contact_facebook_url || null,
            status: 'approved',
            stats: {
                followers: 0,
                views: 0,
                rating_avg: 0,
                rating_count: 0
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await newDoc.set(businessData);
        res.status(201).json({ success: true, business: businessData });
    } catch (error) {
        console.error('Create Business Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create business.', error: error.message });
    }
};

exports.getMyBusiness = async (req, res) => {
    try {
        const owner_uid = req.user.id.toString();
        const snapshot = await businessesRef.where('owner_uid', '==', owner_uid).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Business not found.' });
        }

        const business = snapshot.docs[0].data();
        res.json({ success: true, business });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching business.', error: error.message });
    }
};

exports.getBusinessById = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = businessesRef.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Business not found.' });
        }

        const business = doc.data();

        // Increment view count
        await docRef.update({
            'stats.views': admin.firestore.FieldValue.increment(1)
        });
        business.stats.views += 1;

        if (req.user) {
            const followDoc = await docRef.collection('followers').doc(req.user.id.toString()).get();
            business.isFollowing = followDoc.exists;
        } else {
            business.isFollowing = false;
        }

        res.json({ success: true, business });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching business.', error: error.message });
    }
};

exports.updateBusiness = async (req, res) => {
    try {
        const owner_uid = req.user.id.toString();
        const { name, tagline, about, category, contact_line_id, contact_facebook_url } = req.body;

        const snapshot = await businessesRef.where('owner_uid', '==', owner_uid).limit(1).get();
        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Business not found.' });
        }

        const docRef = snapshot.docs[0].ref;
        const updateData = { updated_at: new Date().toISOString() };

        if (name !== undefined) updateData.name = name;
        if (tagline !== undefined) updateData.tagline = tagline;
        if (about !== undefined) updateData.about = about;
        if (category !== undefined) updateData.category = category;
        if (contact_line_id !== undefined) updateData.contact_line_id = contact_line_id;
        if (contact_facebook_url !== undefined) updateData.contact_facebook_url = contact_facebook_url;

        if (req.files && req.files.cover_image) {
            updateData.cover_image = `/uploads/${req.files.cover_image[0].filename}`;
        }
        if (req.files && req.files.logo_image) {
            updateData.logo_image = `/uploads/${req.files.logo_image[0].filename}`;
        }

        await docRef.update(updateData);
        
        const updatedDoc = await docRef.get();
        res.json({ success: true, business: updatedDoc.data() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating business.', error: error.message });
    }
};

exports.getAllBusinesses = async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        let query = businessesRef.orderBy('created_at', 'desc');

        if (category) {
            query = query.where('category', '==', category);
        }

        const snapshot = await query.limit(50).get();
        let businesses = snapshot.docs.map(doc => doc.data());

        // Basic in-memory search for NoSQL
        if (search) {
            const searchLower = search.toLowerCase();
            businesses = businesses.filter(b => 
                (b.name && b.name.toLowerCase().includes(searchLower)) || 
                (b.tagline && b.tagline.toLowerCase().includes(searchLower))
            );
        }

        res.json({ success: true, businesses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching businesses.', error: error.message });
    }
};

exports.followBusiness = async (req, res) => {
    try {
        const user_uid = req.user.id.toString();
        const { business_id } = req.body;

        const docRef = businessesRef.doc(business_id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ success: false, message: 'Business not found' });

        const followRef = docRef.collection('followers').doc(user_uid);
        const followDoc = await followRef.get();

        if (followDoc.exists) {
            return res.status(400).json({ success: false, message: 'Already following' });
        }

        await firestore.runTransaction(async (t) => {
            t.set(followRef, { created_at: new Date().toISOString() });
            t.update(docRef, {
                'stats.followers': admin.firestore.FieldValue.increment(1)
            });
        });

        res.json({ success: true, message: 'Followed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error following business', error: error.message });
    }
};

exports.unfollowBusiness = async (req, res) => {
    try {
        const user_uid = req.user.id.toString();
        const { business_id } = req.body;

        const docRef = businessesRef.doc(business_id);
        const followRef = docRef.collection('followers').doc(user_uid);
        
        const followDoc = await followRef.get();
        if (followDoc.exists) {
            await firestore.runTransaction(async (t) => {
                t.delete(followRef);
                t.update(docRef, {
                    'stats.followers': admin.firestore.FieldValue.increment(-1)
                });
            });
        }

        res.json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error unfollowing business', error: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const user_uid = req.user.id.toString();
        const { business_id, rating, comment } = req.body;

        const businessRef = businessesRef.doc(business_id);
        const reviewRef = businessRef.collection('reviews').doc();

        const author = {
            id: req.user.id,
            display_name: req.user.display_name || 'Unknown User',
            avatar: req.user.avatar || null
        };

        const reviewData = {
            id: reviewRef.id,
            user_uid,
            author,
            rating: parseFloat(rating),
            comment,
            created_at: new Date().toISOString()
        };

        await firestore.runTransaction(async (t) => {
            const bDoc = await t.get(businessRef);
            if (!bDoc.exists) throw new Error("Business not found");
            
            const stats = bDoc.data().stats || {};
            const currentTotal = (stats.rating_avg || 0) * (stats.rating_count || 0);
            const newCount = (stats.rating_count || 0) + 1;
            const newAvg = ((currentTotal + parseFloat(rating)) / newCount).toFixed(1);

            t.set(reviewRef, reviewData);
            t.update(businessRef, {
                'stats.rating_avg': parseFloat(newAvg),
                'stats.rating_count': newCount
            });
        });

        res.json({ success: true, review: reviewData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating review', error: error.message });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const { business_id } = req.params;
        const snapshot = await businessesRef.doc(business_id).collection('reviews')
                                            .orderBy('created_at', 'desc')
                                            .get();
        const reviews = snapshot.docs.map(doc => doc.data());
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
    }
};

exports.getFollowingFeed = async (req, res) => {
    res.status(501).json({ error: 'Feed not fully migrated yet' });
};

exports.sendMessage = async (req, res) => {
    try {
        const { business_id, message } = req.body;
        const userId = req.user.id.toString();

        const businessRef = businessesRef.doc(business_id);
        const businessDoc = await businessRef.get();
        if (!businessDoc.exists) return res.status(404).json({ message: "Business not found" });

        let sender_type = 'user';
        let targetUserId = userId;

        if (req.body.to_user_id) {
            if (businessDoc.data().owner_uid !== userId) {
                return res.status(403).json({ message: "Only business owner can reply to specific users" });
            }
            sender_type = 'business';
            targetUserId = req.body.to_user_id.toString();
        }

        const inboxRef = businessRef.collection('inbox').doc(targetUserId);
        const messageRef = inboxRef.collection('messages').doc();

        const msgData = {
            id: messageRef.id,
            sender_type,
            message,
            is_read: false,
            created_at: new Date().toISOString()
        };

        await firestore.runTransaction(async (t) => {
            const inboxDoc = await t.get(inboxRef);
            let unreadCount = 0;
            if (inboxDoc.exists && sender_type === 'user') {
                unreadCount = (inboxDoc.data().unread_count || 0) + 1;
            } else if (sender_type === 'user') {
                unreadCount = 1;
            }

            t.set(messageRef, msgData);
            
            t.set(inboxRef, {
                user_id: targetUserId,
                last_message: message,
                updated_at: new Date().toISOString(),
                unread_count: unreadCount,
                user: sender_type === 'user' ? {
                    display_name: req.user.display_name,
                    avatar: req.user.avatar
                } : (inboxDoc.exists ? inboxDoc.data().user : null)
            }, { merge: true });
        });

        res.status(201).json({ success: true, message: msgData });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error sending message" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { business_id } = req.params;
        const userId = req.user.id.toString();

        const businessDoc = await businessesRef.doc(business_id).get();
        if (!businessDoc.exists) return res.status(404).json({ message: "Business not found" });

        let targetUserId = userId;
        if (businessDoc.data().owner_uid === userId) {
            if (!req.query.user_id) {
                return res.status(400).json({ message: "User ID required to fetch conversation" });
            }
            targetUserId = req.query.user_id.toString();
        }

        const snapshot = await businessDoc.ref.collection('inbox').doc(targetUserId)
                                              .collection('messages')
                                              .orderBy('created_at', 'asc')
                                              .get();
        const messages = snapshot.docs.map(doc => doc.data());
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching messages" });
    }
};

exports.getInbox = async (req, res) => {
    try {
        const userId = req.user.id.toString();

        const snapshot = await businessesRef.where('owner_uid', '==', userId).limit(1).get();
        if (snapshot.empty) return res.status(404).json({ message: "Business not found" });

        const inboxSnap = await snapshot.docs[0].ref.collection('inbox')
                                                .orderBy('updated_at', 'desc')
                                                .get();
        
        const conversations = inboxSnap.docs.map(doc => {
            const data = doc.data();
            return {
                user: data.user,
                lastMessage: data.last_message,
                time: data.updated_at,
                unread: data.unread_count || 0
            };
        });

        res.json({ success: true, conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching inbox" });
    }
};

exports.getSystemSettings = async (req, res) => {
    res.json({ success: true, settings: {} });
};

exports.submitVerification = async (req, res) => {
    try {
        const owner_uid = req.user.id.toString();
        const snapshot = await businessesRef.where('owner_uid', '==', owner_uid).limit(1).get();
        
        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'Business not found.' });
        }

        const docRef = snapshot.docs[0].ref;
        const business = snapshot.docs[0].data();
        const documents = business.verification_documents || {};

        if (req.files) {
            if (req.files.vat20) documents.vat20 = `/uploads/${req.files.vat20[0].filename}`;
            if (req.files.certificate) documents.certificate = `/uploads/${req.files.certificate[0].filename}`;
            if (req.files.id_card) documents.id_card = `/uploads/${req.files.id_card[0].filename}`;

            if (req.files.others) {
                const otherFiles = req.files.others.map(f => `/uploads/${f.filename}`);
                documents.others = [...(documents.others || []), ...otherFiles];
            }
        }

        await docRef.update({
            verification_documents: documents,
            verification_status: 'pending'
        });

        const updatedDoc = await docRef.get();
        res.json({ success: true, message: 'Verification documents submitted.', business: updatedDoc.data() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to submit verification.', error: error.message });
    }
};
