const request = require('supertest');
const app = require('../index');

describe('Health Check', () => {
    it('should return 200 and a welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Welcome to PreExam API');
    });
});
