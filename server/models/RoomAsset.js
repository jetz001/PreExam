module.exports = (sequelize, DataTypes) => {
    const RoomAsset = sequelize.define('RoomAsset', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.ENUM('frame', 'background'),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_premium: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'room_assets',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return RoomAsset;
};
