module.exports = (sequelize, DataTypes) => {
    const StudyGroup = sequelize.define('StudyGroup', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        max_members: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        is_private: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'study_groups',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });
    return StudyGroup;
};
