module.exports = (sequelize, DataTypes) => {
    const BusinessPostLike = sequelize.define('BusinessPostLike', {
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

    return BusinessPostLike;
};
