const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SystemSetting = sequelize.define('SystemSetting', {
        key: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'system_settings',
        timestamps: true
    });

    return SystemSetting;
};
