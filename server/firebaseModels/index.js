const BaseModel = require('./BaseModel');

module.exports = {
    User: new BaseModel('users'),
    Business: new BaseModel('businesses'),
    Question: new BaseModel('questions'),
    ExamResult: new BaseModel('exam_results'),
    RoomCustomQuestion: new BaseModel('room_custom_questions')
};
