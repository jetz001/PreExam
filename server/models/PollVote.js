module.exports = (sequelize, DataTypes) => {
    const PollVote = sequelize.define('PollVote', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        poll_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        option_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'poll_votes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });
    return PollVote;
};
