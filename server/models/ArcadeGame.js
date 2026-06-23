module.exports = (sequelize, DataTypes) => {
    const ArcadeGame = sequelize.define('ArcadeGame', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        thumbnail_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        game_url: {
            type: DataTypes.STRING, // For iframe embed
            allowNull: true,
        },
        internal_component: {
            type: DataTypes.STRING, // For internal games we build
            allowNull: true,
        },
        mode: {
            type: DataTypes.ENUM('solo', 'multi', 'both'),
            defaultValue: 'both',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        order_index: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    }, {
        tableName: 'arcade_games',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return ArcadeGame;
};
