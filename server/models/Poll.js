module.exports = (sequelize, DataTypes) => {
    const Poll = sequelize.define('Poll', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        thread_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'polls',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });
    return Poll;
};
