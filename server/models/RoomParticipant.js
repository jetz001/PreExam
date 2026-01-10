module.exports = (sequelize, DataTypes) => {
    const RoomParticipant = sequelize.define('RoomParticipant', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM('joined', 'ready', 'finished'),
            defaultValue: 'joined',
        },
        current_question_index: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        answers: {
            type: DataTypes.JSON, // Store answers temporarily
            allowNull: true,
        }
    }, {
        tableName: 'room_participants',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return RoomParticipant;
};
