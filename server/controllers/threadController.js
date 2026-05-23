const { db: firestore, admin } = require('../config/firebase');
const { logActivity } = require('../utils/activityLogger');
const { v4: uuidv4 } = require('uuid');

const threadsRef = firestore.collection('threads');

exports.createThread = async (req, res) => {
    try {
        const { title, content, category, background_style, tags, poll, shared_news_id } = req.body;
        const userId = req.user.id;

        const newThreadRef = threadsRef.doc();
        const threadId = newThreadRef.id;

        // Embed Author data
        const author = {
            id: req.user.id,
            display_name: req.user.display_name || 'Unknown User',
            avatar: req.user.avatar || null,
            plan_type: req.user.plan_type || 'free'
        };

        let parsedTags = [];
        if (tags) {
            try { parsedTags = JSON.parse(tags); } catch (e) { parsedTags = [tags]; }
        }

        const threadData = {
            id: threadId,
            user_id: userId,
            author,
            title,
            content,
            category: category || 'General',
            background_style: background_style || null,
            image_url: req.file ? `/uploads/${req.file.filename}` : null,
            shared_news_id: shared_news_id || null,
            tags: parsedTags,
            stats: {
                likes: 0,
                comments_count: 0,
                views: 0
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Handle Polls (Basic embed since it's 1-to-1 with thread usually)
        if (poll) {
            const pollData = JSON.parse(poll);
            const { question, options, expires_at } = pollData;
            
            threadData.poll = {
                id: uuidv4(),
                question,
                expires_at: expires_at || null,
                options: options.map(opt => ({
                    id: uuidv4(),
                    option_text: opt,
                    vote_count: 0
                }))
            };
        }

        await newThreadRef.set(threadData);

        // Track tags globally (simple count)
        if (parsedTags.length > 0) {
            const batch = firestore.batch();
            parsedTags.forEach(tag => {
                const tagRef = firestore.collection('tags').doc(tag);
                batch.set(tagRef, {
                    name: tag,
                    usage_count: admin.firestore.FieldValue.increment(1)
                }, { merge: true });
            });
            await batch.commit();
        }

        const io = req.app.get('io');
        if (io) io.emit('new_thread', threadData);

        logActivity(req, 'BTN_CREATE_THREAD', { thread_id: threadId, title });

        res.status(201).json(threadData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating thread' });
    }
};

exports.shareNews = async (req, res) => {
    // simplified for brevity
    res.status(501).json({ error: 'Not fully migrated yet' });
};

exports.shareBusinessPost = async (req, res) => {
    res.status(501).json({ error: 'Not fully migrated yet' });
};

exports.getThreads = async (req, res) => {
    try {
        const { cursor, limit = 10, category, search, sort = 'newest' } = req.query;
        let query = threadsRef.orderBy('created_at', 'desc');

        if (category && category !== 'all' && category !== 'undefined') {
            query = query.where('category', '==', category);
        }

        // Firestore does not support native text search.
        // If search is provided, we'll try a basic array-contains on tags or exact title match
        if (search) {
            // Simplified fallback
            query = query.where('tags', 'array-contains', search);
            if (req.user) {
                await firestore.collection('search_logs').add({
                    user_id: req.user.id,
                    keyword: search,
                    created_at: new Date().toISOString()
                });
            }
        }

        if (cursor) {
            const cursorDoc = await threadsRef.doc(cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        }

        query = query.limit(parseInt(limit));
        const snapshot = await query.get();

        const userId = req.user ? req.user.id : null;
        let nextCursor = null;

        const threads = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            
            // Check if liked
            data.isLiked = false;
            if (userId) {
                const likeDoc = await doc.ref.collection('likes').doc(userId.toString()).get();
                data.isLiked = likeDoc.exists;
                
                // Poll check
                if (data.poll) {
                    const voteDoc = await doc.ref.collection('poll_votes').doc(userId.toString()).get();
                    data.poll.isVoted = voteDoc.exists;
                    data.poll.votedOptionId = voteDoc.exists ? voteDoc.data().option_id : null;
                }
            }
            return data;
        }));

        if (snapshot.docs.length === parseInt(limit)) {
            nextCursor = snapshot.docs[snapshot.docs.length - 1].id;
        }

        if (!cursor && req.user) {
            logActivity(req, 'BTN_VIEW_COMMUNITY', { category: category || 'all' });
        }

        res.json({ threads, nextCursor });
    } catch (error) {
        console.error('ERROR in getThreads:', error);
        res.status(500).json({ error: 'Server error fetching threads' });
    }
};

exports.getThreadById = async (req, res) => {
    try {
        const { id } = req.params;
        const threadDoc = await threadsRef.doc(id).get();
        if (!threadDoc.exists) return res.status(404).json({ error: 'Thread not found' });

        const data = threadDoc.data();

        // Increment views
        await threadDoc.ref.update({
            'stats.views': admin.firestore.FieldValue.increment(1)
        });
        data.stats.views += 1;

        if (req.user) {
            logActivity(req, 'BTN_VIEW_THREAD', { thread_id: id, title: data.title });
            const userId = req.user.id;
            
            const likeDoc = await threadDoc.ref.collection('likes').doc(userId.toString()).get();
            data.isLiked = likeDoc.exists;

            if (data.poll) {
                const voteDoc = await threadDoc.ref.collection('poll_votes').doc(userId.toString()).get();
                data.poll.isVoted = voteDoc.exists;
                data.poll.votedOptionId = voteDoc.exists ? voteDoc.data().option_id : null;
            }
        } else {
            data.isLiked = false;
            if (data.poll) data.poll.isVoted = false;
        }

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.likeThread = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id.toString();
        const threadDoc = threadsRef.doc(id);

        const likeRef = threadDoc.collection('likes').doc(userId);
        const likeSnap = await likeRef.get();

        let liked = false;
        if (likeSnap.exists) {
            await likeRef.delete();
            await threadDoc.update({
                'stats.likes': admin.firestore.FieldValue.increment(-1)
            });
            liked = false;
        } else {
            await likeRef.set({ created_at: new Date().toISOString() });
            await threadDoc.update({
                'stats.likes': admin.firestore.FieldValue.increment(1)
            });
            liked = true;
        }

        const updatedSnap = await threadDoc.get();
        res.json({ likes: updatedSnap.data().stats.likes, liked });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.votePoll = async (req, res) => {
    try {
        const { pollId, optionId } = req.body;
        // In this architecture, we need the threadId too. Let's assume the client sends it or we find it.
        // If client only sends pollId, we must query for it.
        const snapshot = await threadsRef.where('poll.id', '==', pollId).limit(1).get();
        if (snapshot.empty) return res.status(404).json({ error: 'Poll not found' });
        
        const threadDoc = snapshot.docs[0];
        const userId = req.user.id.toString();
        const voteRef = threadDoc.ref.collection('poll_votes').doc(userId);
        
        const voteSnap = await voteRef.get();
        if (voteSnap.exists) {
            return res.status(400).json({ error: 'Already voted' });
        }

        // Transaction to ensure option count is atomic
        await firestore.runTransaction(async (t) => {
            const tDoc = await t.get(threadDoc.ref);
            const data = tDoc.data();
            const optionIndex = data.poll.options.findIndex(o => o.id === optionId);
            if(optionIndex === -1) throw new Error('Option not found');

            data.poll.options[optionIndex].vote_count += 1;

            t.update(threadDoc.ref, { poll: data.poll });
            t.set(voteRef, { option_id: optionId, created_at: new Date().toISOString() });
        });

        const updatedDoc = await threadDoc.ref.get();
        const io = req.app.get('io');
        if (io) io.emit('poll_updated', updatedDoc.data().poll);

        res.json(updatedDoc.data().poll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error voting' });
    }
};

exports.getUserThreads = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await threadsRef.where('user_id', '==', parseInt(userId))
                                       .orderBy('created_at', 'desc')
                                       .limit(20).get();
        
        const threads = snapshot.docs.map(doc => {
            const data = doc.data();
            data.isLiked = false;
            return data;
        });

        res.json(threads);
    } catch (error) {
        console.error("Get User Threads Error", error);
        res.status(500).json({ error: 'Server error fetching user threads' });
    }
};

exports.getTrendingTags = async (req, res) => {
    try {
        const snapshot = await firestore.collection('tags').orderBy('usage_count', 'desc').limit(8).get();
        const tags = snapshot.docs.map(doc => ({
            keyword: doc.data().name,
            count: doc.data().usage_count
        }));
        res.json(tags);
    } catch (error) {
        console.error('Get Trending Tags Error:', error);
        res.status(500).json({ error: 'Server error fetching trending tags' });
    }
};

exports.deleteThread = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const threadDoc = await threadsRef.doc(id).get();
        if (!threadDoc.exists) return res.status(404).json({ error: 'Thread not found' });

        if (threadDoc.data().user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await threadDoc.ref.delete();

        const io = req.app.get('io');
        if (io) io.emit('delete_thread', id);

        res.json({ message: 'Thread deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error deleting thread' });
    }
};
