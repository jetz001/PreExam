module.exports = (sequelize, DataTypes) => {
    const Business = sequelize.define('Business', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        owner_uid: {
            type: DataTypes.INTEGER, // Using Integer to match likely User ID type
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tagline: {
            type: DataTypes.STRING
        },
        about: {
            type: DataTypes.TEXT
        },
        category: {
            type: DataTypes.STRING
        },
        cover_image: {
            type: DataTypes.STRING
        },
        logo_image: {
            type: DataTypes.STRING
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        page_layout: {
            type: DataTypes.STRING,
            defaultValue: 'content_first'
        },
        contact_line_id: {
            type: DataTypes.STRING
        },
        contact_facebook_url: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        stats: {
            type: DataTypes.JSON, // { views: 0, clicks: 0, followers: 0 }
            defaultValue: { views: 0, clicks: 0, followers: 0 }
        },
        ads_config: {
            type: DataTypes.JSON, // { zone_b_expiry: null, ... }
            defaultValue: {}
        },
        rating_avg: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },
        rating_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        verification_documents: {
            type: DataTypes.JSON, // { vat20: string, certificate: string, id_card: string, others: [] }
            defaultValue: {}
        },
        verification_status: {
            type: DataTypes.ENUM('unverified', 'pending', 'verified', 'rejected'),
            defaultValue: 'unverified'
        }
    });

    return Business;
};
