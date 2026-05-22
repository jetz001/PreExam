module.exports = (sequelize, DataTypes) => {
    const InterestTag = sequelize.define('InterestTag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tag_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        usage_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        last_active_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'interest_tags',
        timestamps: false,
    });
    return InterestTag;
};
