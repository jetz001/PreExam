const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const AdsConfig = sequelize.define('AdsConfig', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, // Or helper if Sequelize < 6
            primaryKey: true,
        },
        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // One config per business
        },
        zone_a_expiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        zone_b_expiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        last_payment_id: {
            type: DataTypes.UUID, // FK to Transaction.id
            allowNull: true,
        },
    }, {
        tableName: 'ads_configs', // updated to snake_case plural usually
        timestamps: false, // Schema didn't specify timestamps, but maybe good to have? Prompt says "Update...". I'll skip default timestamps unless needed.
    });

    AdsConfig.associate = (models) => {
        AdsConfig.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
        // Optional: Associate with Transaction if needed
        // AdsConfig.belongsTo(models.Transaction, { foreignKey: 'last_payment_id' });
    };

    return AdsConfig;
};
