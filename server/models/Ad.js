module.exports = (sequelize, DataTypes) => {
    const Ad = sequelize.define('Ad', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sponsor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.STRING, // For now storing URL/Path
            allowNull: true,
        },
        link_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        placement: {
            type: DataTypes.ENUM('feed', 'result'),
            defaultValue: 'feed',
        },
        status: {
            type: DataTypes.ENUM('active', 'paused', 'rejected', 'completed', 'pending_approval'),
            defaultValue: 'active', // Self-service might default to active or pending
        },
        budget_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 1000.00,
        },
        budget_spent: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        cpm_bid: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 50.00, // Standard CP 50 THB
        },
        cpc_bid: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 5.00, // Standard CPC 5 THB
        },
        views_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        clicks_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        tableName: 'ads',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    Ad.associate = (models) => {
        Ad.belongsTo(models.User, { foreignKey: 'sponsor_id', as: 'sponsor' });
    };

    return Ad;
};
