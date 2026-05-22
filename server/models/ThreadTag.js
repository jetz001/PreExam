module.exports = (sequelize, DataTypes) => {
    const ThreadTag = sequelize.define('ThreadTag', {
        thread_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'threads',
                key: 'id',
            },
        },
        tag_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'interest_tags',
                key: 'id',
            },
        },
    }, {
        tableName: 'thread_tags',
        timestamps: false,
    });
    return ThreadTag;
};
