module.exports = (sequelize, DataTypes) => {
    const SponsorTransaction = sequelize.define('SponsorTransaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sponsor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('deposit'), // Future: withdrawal
            defaultValue: 'deposit',
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'rejected'),
            defaultValue: 'pending',
        },
        slip_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        admin_note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'sponsor_transactions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    SponsorTransaction.associate = (models) => {
        SponsorTransaction.belongsTo(models.User, { foreignKey: 'sponsor_id', as: 'sponsor' });
    };

    return SponsorTransaction;
};
