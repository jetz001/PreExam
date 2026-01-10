module.exports = (sequelize, DataTypes) => {
    const BusinessMessage = sequelize.define('BusinessMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        sender_type: {
            type: DataTypes.ENUM('user', 'business'),
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'business_messages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return BusinessMessage;
};
