module.exports = (sequelize, DataTypes) => {
    const PaymentSlip = sequelize.define('PaymentSlip', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        slip_image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
        },
    }, {
        tableName: 'payment_slips',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });
    return PaymentSlip;
};
