module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        stripe_session_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        business_id: {
            type: DataTypes.INTEGER, // Nullable, for AD_PURCHASE
            allowNull: true,
        },
        plan_id: {
            type: DataTypes.INTEGER, // Nullable, for legacy PLAN_PURCHASE
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM('AD_PURCHASE', 'WALLET_TOPUP', 'PLAN_PURCHASE'),
            allowNull: false,
            defaultValue: 'PLAN_PURCHASE' // Default for backward compatibility if any
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.STRING, // 'card', 'promptpay', or legacy enum
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING, // 'PENDING', 'SUCCESS', 'FAILED', 'pending', 'approved'
            defaultValue: 'PENDING',
        },
        metadata: {
            type: DataTypes.TEXT, // Using TEXT for JSON string
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('metadata');
                return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value) {
                this.setDataValue('metadata', JSON.stringify(value));
            }
        },
        receipt_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // Legacy fields specific to manual transfer
        slip_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        admin_note: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        tableName: 'transactions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Transaction.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
        Transaction.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'plan' });
    };

    return Transaction;
};
