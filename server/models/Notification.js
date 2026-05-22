module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING, // 'like', 'comment', 'reply', 'system'
            allowNull: false,
        },
        source_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        message: { // Optional simple message
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'notifications',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });
    return Notification;
};
