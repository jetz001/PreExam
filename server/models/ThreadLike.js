module.exports = (sequelize, DataTypes) => {
    const ThreadLike = sequelize.define('ThreadLike', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        thread_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'thread_likes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'thread_id']
            }
        ]
    });
    return ThreadLike;
};
