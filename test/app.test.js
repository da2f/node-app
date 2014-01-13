var expect = require('chai').expect,
    request = require('supertest'),
    app = require('../app');

describe('node-app', function () {
    it('check index', function (done) {
        request(app).get('/')
            .expect('Content-Type', /text\/html/)
            .expect(200, done);
    });
});