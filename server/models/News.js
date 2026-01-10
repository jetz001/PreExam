module.exports = (sequelize, DataTypes) => {
    const News = sequelize.define('News', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: '',
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        external_link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pdf_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        product_link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        keywords: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        source_memo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        published_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        featured_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'news',
        timestamps: false,
    });
    return News;
};
