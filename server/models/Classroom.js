module.exports = (sequelize, DataTypes) => {
    const Classroom = sequelize.define('Classroom', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        teacher_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'classrooms',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    });
    return Classroom;
};
