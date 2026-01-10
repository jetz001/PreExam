module.exports = (sequelize, DataTypes) => {
    const SearchTerm = sequelize.define('SearchTerm', {
        term: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        count: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    }, {
        tableName: 'search_terms',
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at' // Optional, but good for "trending lately"
    });

    return SearchTerm;
};
