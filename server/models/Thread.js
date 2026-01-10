module.exports = (sequelize, DataTypes) => {
    const Thread = sequelize.define('Thread', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        background_style: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        shared_news_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'news',
                key: 'id'
            }
        },
        shared_business_post_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'business_posts',
                key: 'id'
            }
        },
    }, {
        tableName: 'threads',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true, // Enables deleted_at
        deletedAt: 'deleted_at',
    });
    return Thread;
};
