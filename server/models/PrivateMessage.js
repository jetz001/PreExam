module.exports = (sequelize, DataTypes) => {
    const PrivateMessage = sequelize.define('PrivateMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        tableName: 'private_messages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });

    PrivateMessage.associate = (models) => {
        PrivateMessage.belongsTo(models.User, { foreignKey: 'sender_id', as: 'Sender' });
        PrivateMessage.belongsTo(models.User, { foreignKey: 'receiver_id', as: 'Receiver' });
    };

    return PrivateMessage;
};
