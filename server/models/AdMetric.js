module.exports = (sequelize, DataTypes) => {
    const AdMetric = sequelize.define('AdMetric', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ad_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        viewer_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // Nullable for guests
        },
        type: {
            type: DataTypes.ENUM('view', 'click'),
            allowNull: false,
        },
        cost: {
            type: DataTypes.DECIMAL(10, 4), // 4 decimal places for micro-transactions
            defaultValue: 0.0000,
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: 'ad_metrics',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false, // Immutable log
    });

    AdMetric.associate = (models) => {
        AdMetric.belongsTo(models.Ad, { foreignKey: 'ad_id', as: 'ad' });
        AdMetric.belongsTo(models.User, { foreignKey: 'viewer_id', as: 'viewer' });
    };

    return AdMetric;
};
