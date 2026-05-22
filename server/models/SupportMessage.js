module.exports = (sequelize, DataTypes) => {
    const SupportMessage = sequelize.define('SupportMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ticket_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('user', 'admin', 'system'),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        attachments: {
            type: DataTypes.JSON, // Array of URLs
            allowNull: true,
        },
        is_internal_note: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        tableName: 'support_messages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });

    SupportMessage.associate = (models) => {
        SupportMessage.belongsTo(models.SupportTicket, { foreignKey: 'ticket_id', as: 'ticket' });
        SupportMessage.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
    };

    return SupportMessage;
};
