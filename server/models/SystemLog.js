module.exports = (sequelize, DataTypes) => {
    const SystemLog = sequelize.define('SystemLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        action: {
            type: DataTypes.STRING, // e.g., 'BACKUP_CREATE', 'BACKUP_RESTORE'
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('SUCCESS', 'FAILED', 'PENDING'),
            defaultValue: 'PENDING'
        },
        details: {
            type: DataTypes.TEXT, // Store JSON string or message
            get() {
                const rawValue = this.getDataValue('details');
                try {
                    return rawValue ? JSON.parse(rawValue) : {};
                } catch (e) {
                    return rawValue;
                }
            },
            set(value) {
                if (typeof value === 'object') {
                    this.setDataValue('details', JSON.stringify(value));
                } else {
                    this.setDataValue('details', value);
                }
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true // System actions might be null, or admin ID
        }
    }, {
        tableName: 'system_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    SystemLog.associate = (models) => {
        SystemLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    };

    return SystemLog;
};
