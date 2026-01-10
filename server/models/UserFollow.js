module.exports = (sequelize, DataTypes) => {
    const UserFollow = sequelize.define('UserFollow', {
        user_uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    });

    return UserFollow;
};
