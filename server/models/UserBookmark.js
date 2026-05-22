module.exports = (sequelize, DataTypes) => {
    const UserBookmark = sequelize.define('UserBookmark', {
        user_uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        post_id: {
            type: DataTypes.INTEGER, // References BusinessPost
            allowNull: false,
            primaryKey: true
        }
    });

    return UserBookmark;
};
