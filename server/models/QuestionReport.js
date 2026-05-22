module.exports = (sequelize, DataTypes) => {
    const QuestionReport = sequelize.define('QuestionReport', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'resolved', 'ignored'),
            defaultValue: 'pending',
        },
    }, {
        tableName: 'question_reports',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return QuestionReport;
};
