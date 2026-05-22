module.exports = (sequelize, DataTypes) => {
    const ClassroomMember = sequelize.define('ClassroomMember', {
        classroom_id: {
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
        tableName: 'classroom_members',
        timestamps: false,
    });
    return ClassroomMember;
};
