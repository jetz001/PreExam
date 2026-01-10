module.exports = (sequelize, DataTypes) => {
    const ExamResult = sequelize.define('ExamResult', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        classroom_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        mode: {
            type: DataTypes.ENUM('practice', 'simulation', 'classroom'),
            allowNull: false,
        },
        subject_scores: {
            type: DataTypes.TEXT, // JSON string
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('subject_scores');
                return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value) {
                this.setDataValue('subject_scores', JSON.stringify(value));
            }
        },
        skill_scores: {
            type: DataTypes.TEXT, // JSON string
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('skill_scores');
                return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value) {
                this.setDataValue('skill_scores', JSON.stringify(value));
            }
        },
        questions: {
            type: DataTypes.TEXT, // JSON string of detailed Q&A
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('questions');
                return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value) {
                this.setDataValue('questions', JSON.stringify(value));
            }
        },
        time_taken: {
            type: DataTypes.INTEGER, // seconds
            allowNull: false,
        },
        taken_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        feedback_comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'exam_results',
        timestamps: false, // We use taken_at
    });

    return ExamResult;
};
