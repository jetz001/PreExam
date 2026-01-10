module.exports = (sequelize, DataTypes) => {
    const NewsSource = sequelize.define('NewsSource', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'news_sources',
        timestamps: false,
    });
    return NewsSource;
};
