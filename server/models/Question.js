module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        question_text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        question_image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        choice_a: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        choice_b: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        choice_c: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        choice_d: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        correct_answer: {
            type: DataTypes.ENUM('A', 'B', 'C', 'D'),
            allowNull: false,
        },
        explanation: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING, // 'local_gov', 'ocsc' (Deprecated in favor of catalogs)
            allowNull: true,
        },
        skill: {
            type: DataTypes.STRING, // For Radar Chart (e.g., 'Finance', 'Management')
            allowNull: true,
        },
        catalogs: {
            type: DataTypes.JSON, // ['Part A Local', 'Part A OCSC']
            allowNull: true,
            defaultValue: [],
            get() {
                const rawValue = this.getDataValue('catalogs');
                if (!rawValue) return [];
                if (typeof rawValue === 'string') {
                    try { return JSON.parse(rawValue); } catch (e) { return []; }
                }
                return rawValue;
            }
        },
        subject: {
            type: DataTypes.STRING, // 'thai', 'english', 'law'
            allowNull: false,
        },
        difficulty: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        ratingCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        tableName: 'questions',
        timestamps: true, // Sequelize adds createdAt, updatedAt by default
    });

    return Question;
};
