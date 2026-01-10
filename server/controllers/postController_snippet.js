
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags, series_name, is_pinned } = req.body;
        const userId = req.user.id; // User from token

        const post = await BusinessPost.findByPk(id, {
            include: [{ model: Business, as: 'Business' }]
        });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Verify Ownership
        if (String(post.Business.owner_uid) !== String(userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Handle Pinned Logic
        if (is_pinned === true || is_pinned === 'true') {
            // If pinning this one, unpin others
            await BusinessPost.update({ is_pinned: false }, { where: { business_id: post.business_id } });
        }

        // Update Fields
        if (title) post.title = title;
        if (content) post.content = content;
        if (tags) post.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (series_name !== undefined) post.series_name = series_name;
        if (is_pinned !== undefined) post.is_pinned = is_pinned === 'true' || is_pinned === true;

        // Handle Images
        // If new images are uploaded, they REPLACE the old ones (simple logic for now)
        // OR we could append. Let's assume replace if files are present.
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/${file.filename}`);
            post.images = newImages;
        }

        await post.save();

        res.json({ success: true, post });
    } catch (error) {
        console.error('Update Post Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update post', error: error.message });
    }
};
