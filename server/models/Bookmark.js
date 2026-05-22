module.exports = (sequelize, DataTypes) => {
    const Bookmark = sequelize.define('Bookmark', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        target_type: {
            type: DataTypes.ENUM('news', 'question', 'thread'),
            allowNull: false,
        },
        target_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true, // Cached title for display
        },
        saved_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'bookmarks',
        timestamps: false,
    });

    Bookmark.associate = (models) => {
        Bookmark.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return Bookmark;
};
