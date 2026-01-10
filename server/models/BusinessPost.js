module.exports = (sequelize, DataTypes) => {
    const BusinessPost = sequelize.define('BusinessPost', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('article', 'product'),
            defaultValue: 'article'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT // HTML Content
        },
        price: {
            type: DataTypes.DECIMAL(10, 2), // Only for products
            defaultValue: null
        },
        tags: {
            type: DataTypes.TEXT, // Store as JSON string or comma-separated
            get() {
                const rawValue = this.getDataValue('tags');
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(value) {
                this.setDataValue('tags', JSON.stringify(value));
            }
        },
        series_name: {
            type: DataTypes.STRING
        },
        images: {
            type: DataTypes.TEXT, // Store as JSON string of URLs
            get() {
                const rawValue = this.getDataValue('images');
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(value) {
                this.setDataValue('images', JSON.stringify(value));
            }
        },
        likes_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_pinned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_boosted: {
            type: DataTypes.BOOLEAN, // For ads (Zone B)
            defaultValue: false
        },
        ad_status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        }
    });

    return BusinessPost;
};
