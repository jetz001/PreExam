module.exports = (sequelize, DataTypes) => {
    const UserRankingStats = sequelize.define('UserRankingStats', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING, // 'law', 'thai', 'eng', 'math', 'local'
            allowNull: false,
        },
        accumulated_score: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        total_questions_attempted: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        accuracy_rate: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        last_updated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'user_ranking_stats',
        timestamps: false, // We use last_updated manually or let it be handle by logic, but no createdAt/updatedAt unless needed.
        // Actually it's better to have timestamps but schema requested `last_updated`
    });

    UserRankingStats.associate = (models) => {
        UserRankingStats.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return UserRankingStats;
};
