module.exports = (sequelize, DataTypes) => {
    const SearchLog = sequelize.define('SearchLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        keyword: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: 'general',
        },
    }, {
        tableName: 'search_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });
    return SearchLog;
};
