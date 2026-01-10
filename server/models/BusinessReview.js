module.exports = (sequelize, DataTypes) => {
    const BusinessReview = sequelize.define('BusinessReview', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_uid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 }
        },
        comment: {
            type: DataTypes.TEXT
        },
        owner_reply: {
            type: DataTypes.TEXT
        },
        reply_at: {
            type: DataTypes.DATE
        }
    });

    return BusinessReview;
};
