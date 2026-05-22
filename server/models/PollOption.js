module.exports = (sequelize, DataTypes) => {
    const PollOption = sequelize.define('PollOption', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        poll_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        option_text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vote_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        tableName: 'poll_options',
        timestamps: false,
    });
    return PollOption;
};
