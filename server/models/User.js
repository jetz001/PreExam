module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        public_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: true, // Nullable for Google Login users
        },
        google_id: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        facebook_id: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        wallet_address: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        display_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user', 'teacher', 'sponsor'),
            defaultValue: 'user',
        },
        plan_type: {
            type: DataTypes.ENUM('free', 'premium'),
            defaultValue: 'free',
        },
        status: {
            type: DataTypes.ENUM('active', 'banned'),
            defaultValue: 'active',
        },
        premium_expiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        premium_start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        last_announcement_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // Profile & Goals
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        target_exam: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        target_exam_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        streak_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        last_active_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // Privacy Settings
        is_public_stats: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        is_online_visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        allow_friend_request: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        // Notification Settings
        notify_study_group: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        notify_friend_request: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        notify_news_update: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        // App Preferences
        theme_preference: {
            type: DataTypes.STRING, // 'light', 'dark', 'system'
            defaultValue: 'system',
        },
        font_size_preference: {
            type: DataTypes.STRING, // 'small', 'medium', 'large'
            defaultValue: 'medium',
        },
        // Gamification & Tracking
        xp_points: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        rank_level: {
            type: DataTypes.STRING,
            defaultValue: 'Newbie', // e.g., Apprentice, Operating, Expert
        },
        mistake_history: {
            type: DataTypes.JSON, // Array of question IDs e.g. [1, 5, 10]
            allowNull: true,
        },
        // Sponsor Fields
        business_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tax_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        wallet_balance: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        business_info: {
            type: DataTypes.JSON,
            allowNull: true, // { website, address, line_id, phone, email }
        },
        // Admin Permissions
        admin_permissions: {
            type: DataTypes.JSON, // Array of strings: ['manage_users', 'manage_exams']
            allowNull: true,
            defaultValue: [],
        },
        reset_password_token: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reset_password_expires: {
            // Check usage in controller: storing Date.now() + 3600000 (number)
            // If defined as DATE, Sequelize converts number to Date object for DB.
            // SQLite stores DATE as string or number.
            // Let's use DATE to be consistent with other date fields.
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    User.associate = (models) => {
        User.hasMany(models.Ad, { foreignKey: 'sponsor_id', as: 'ads' });
        User.hasMany(models.SponsorTransaction, { foreignKey: 'sponsor_id', as: 'sponsor_transactions' });
    };

    return User;
};
