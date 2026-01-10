module.exports = (sequelize, DataTypes) => {
    const ReportedContent = sequelize.define('ReportedContent', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        reporter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        target_type: {
            type: DataTypes.ENUM('thread', 'comment'),
            allowNull: false,
        },
        target_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
            defaultValue: 'pending',
        },
    }, {
        tableName: 'reported_content',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
    return ReportedContent;
};
