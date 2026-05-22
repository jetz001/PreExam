module.exports = (sequelize, DataTypes) => {
    const GroupMessage = sequelize.define('GroupMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        tableName: 'group_messages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false, // Messages usually don't need update timestamp unless editable
    });

    GroupMessage.associate = (models) => {
        GroupMessage.belongsTo(models.StudyGroup, { foreignKey: 'group_id', as: 'group' });
        GroupMessage.belongsTo(models.User, { foreignKey: 'user_id', as: 'sender' });
    };

    return GroupMessage;
};
