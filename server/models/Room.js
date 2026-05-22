module.exports = (sequelize, DataTypes) => {
    const Room = sequelize.define('Room', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mode: {
            type: DataTypes.ENUM('exam', 'tutor', 'event'),
            allowNull: false,
        },
        host_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        max_participants: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
        },
        question_count: {
            type: DataTypes.INTEGER,
            defaultValue: 20,
        },
        status: {
            type: DataTypes.ENUM('waiting', 'in_progress', 'finished'),
            defaultValue: 'waiting',
        },
        settings: {
            type: DataTypes.JSON, // Stores time_limit, etc.
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        question_ids: {
            type: DataTypes.JSON, // Array of question IDs
            allowNull: true,
        },
        theme: {
            type: DataTypes.JSON, // { background_id: 1, frame_id: 2 }
            allowNull: true,
        },
        theme_color: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        background_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },

    }, {
        tableName: 'rooms',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Room;
};
