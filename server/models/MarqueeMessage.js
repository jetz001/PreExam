module.exports = (sequelize, DataTypes) => {
    const MarqueeMessage = sequelize.define('MarqueeMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        display_until: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'marquee_messages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });
    return MarqueeMessage;
};
