module.exports = (sequelize, DataTypes) => {
    const Friendship = sequelize.define('Friendship', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        friend_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted'),
            defaultValue: 'pending',
        },
    }, {
        tableName: 'friendships',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });
    return Friendship;
};
