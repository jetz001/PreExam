module.exports = (sequelize, DataTypes) => {
    const SupportTicket = sequelize.define('SupportTicket', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_tier: {
            type: DataTypes.ENUM('free', 'premium', 'sponsor'),
            defaultValue: 'free',
        },
        category: {
            type: DataTypes.ENUM('bug', 'content', 'payment', 'suggestion', 'privacy', 'report'),
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
            defaultValue: 'open',
        },
        priority: {
            type: DataTypes.ENUM('normal', 'high'),
            defaultValue: 'normal',
        },
        device_info: {
            type: DataTypes.JSON, // { browser, os, screen_size }
            allowNull: true,
        },
        context_data: {
            type: DataTypes.JSON, // { exam_id, question_id, shop_id, transaction_id }
            allowNull: true,
        },
    }, {
        tableName: 'support_tickets',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    SupportTicket.associate = (models) => {
        SupportTicket.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        SupportTicket.hasMany(models.SupportMessage, { foreignKey: 'ticket_id', as: 'messages' });
    };

    return SupportTicket;
};
