module.exports = (sequelize, DataTypes) => {
    const StudyGroupMember = sequelize.define('StudyGroupMember', {
        group_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        joined_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'study_group_members',
        timestamps: false,
    });

    StudyGroupMember.associate = (models) => {
        StudyGroupMember.belongsTo(models.StudyGroup, { foreignKey: 'group_id' });
        StudyGroupMember.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return StudyGroupMember;
};
