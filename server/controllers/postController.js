const { db: firestore, admin } = require('../config/firebase');

const businessesRef = firestore.collection('businesses');
const postsRef = firestore.collection('business_posts');
const notificationsRef = firestore.collection('notifications');

exports.createPost = async (req, res) => {
    try {
        const { business_id, type, title, content, tags, series_name, is_pinned } = req.body;
        const userId = req.user.id.toString();

        if (!business_id) return res.status(400).json({ success: false, message: 'Business ID is required' });

        const businessDoc = await businessesRef.doc(business_id).get();
        if (!businessDoc.exists) return res.status(404).json({ success: false, message: 'Business not found' });

        if (businessDoc.data().owner_uid !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (is_pinned === true || is_pinned === 'true') {
            const pinnedSnap = await postsRef.where('business_id', '==', business_id).where('is_pinned', '==', true).get();
            const batch = firestore.batch();
            pinnedSnap.docs.forEach(doc => {
                batch.update(doc.ref, { is_pinned: false });
            });
            await batch.commit();
        }

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/${file.filename}`);
        }

        const newPostRef = postsRef.doc();
        const postData = {
            id: newPostRef.id,
            business_id,
            type,
            title,
            content,
            tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
            series_name: series_name || null,
            is_pinned: is_pinned === 'true' || is_pinned === true,
            images,
            likes_count: 0,
            Business: {
                id: businessDoc.id,
                name: businessDoc.data().name,
                logo_image: businessDoc.data().logo_image || null
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await newPostRef.set(postData);

        try {
            const followersSnap = await businessDoc.ref.collection('followers').get();
            if (!followersSnap.empty) {
                const batch = firestore.batch();
                followersSnap.docs.forEach(follower => {
                    const notifRef = notificationsRef.doc();
                    batch.set(notifRef, {
                        id: notifRef.id,
                        user_id: follower.id,
                        type: 'new_post',
                        source_id: newPostRef.id,
                        message: `${businessDoc.data().name} posted a new update: ${title}`,
                        is_read: false,
                        created_at: new Date().toISOString()
                    });
                });
                await batch.commit();
            }
        } catch (e) {
            console.error('Notification Error:', e);
        }

        res.status(201).json({ success: true, post: postData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create post' });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { business_id, limit = 20, page = 1 } = req.query;
        let query = postsRef;
        if (business_id) query = query.where('business_id', '==', business_id);

        const snapshot = await query.orderBy('is_pinned', 'desc').orderBy('created_at', 'desc').limit(parseInt(limit)).get();
        const posts = snapshot.docs.map(doc => doc.data());

        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }
};

exports.getPostDetail = async (req, res) => {
    try {
        const doc = await postsRef.doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, post: doc.data() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch post' });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const user_uid = req.user.id.toString();
        const { post_id } = req.body;

        const postRef = postsRef.doc(post_id);
        const likeRef = postRef.collection('likes').doc(user_uid);

        let liked = false;
        await firestore.runTransaction(async (t) => {
            const likeDoc = await t.get(likeRef);
            if (likeDoc.exists) {
                t.delete(likeRef);
                t.update(postRef, { likes_count: admin.firestore.FieldValue.increment(-1) });
                liked = false;
            } else {
                t.set(likeRef, { created_at: new Date().toISOString() });
                t.update(postRef, { likes_count: admin.firestore.FieldValue.increment(1) });
                liked = true;
            }
        });

        const updatedDoc = await postRef.get();
        res.json({ success: true, liked, likes_count: updatedDoc.data().likes_count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling like' });
    }
};

exports.toggleBookmark = async (req, res) => {
    try {
        const user_uid = req.user.id.toString();
        const { post_id } = req.body;

        const postRef = postsRef.doc(post_id);
        const bookmarkRef = postRef.collection('bookmarks').doc(user_uid);

        let bookmarked = false;
        await firestore.runTransaction(async (t) => {
            const bookmarkDoc = await t.get(bookmarkRef);
            if (bookmarkDoc.exists) {
                t.delete(bookmarkRef);
                bookmarked = false;
            } else {
                t.set(bookmarkRef, { created_at: new Date().toISOString() });
                bookmarked = true;
            }
        });

        res.json({ success: true, bookmarked });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling bookmark' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags, series_name, is_pinned } = req.body;
        const userId = req.user.id.toString();

        const postRef = postsRef.doc(id);
        const postDoc = await postRef.get();
        if (!postDoc.exists) return res.status(404).json({ success: false, message: 'Post not found' });

        const businessDoc = await businessesRef.doc(postDoc.data().business_id).get();
        if (businessDoc.data().owner_uid !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (is_pinned === true || is_pinned === 'true') {
            const pinnedSnap = await postsRef.where('business_id', '==', postDoc.data().business_id).where('is_pinned', '==', true).get();
            const batch = firestore.batch();
            pinnedSnap.docs.forEach(doc => {
                if (doc.id !== id) batch.update(doc.ref, { is_pinned: false });
            });
            await batch.commit();
        }

        const updateData = { updated_at: new Date().toISOString() };
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (tags) updateData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (series_name !== undefined) updateData.series_name = series_name;
        if (is_pinned !== undefined) updateData.is_pinned = is_pinned === 'true' || is_pinned === true;

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => `/uploads/${file.filename}`);
        }

        await postRef.update(updateData);
        const updatedDoc = await postRef.get();

        res.json({ success: true, post: updatedDoc.data() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update post' });
    }
};
