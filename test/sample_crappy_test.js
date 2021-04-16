const expect = require("chai").expect;
const uuid = require('node-uuid');
const env = {
    request: 'get_env',
    AuthHeader: 'auth_token',
}

describe.skip('Proxy Tests', () => {

    it('GET /v1/uploads/{jobId}/finalize should return 400', function (done) {
        this.timeout(10000);
        env.request
            .get('/v1/uploads/12345')
            .set(env.AuthHeader)
            .expect(400)
            .end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                done();
            });
    });

    it('POST /v1/uploads/{jobId}/finalize should return 400', function (done) {
        this.timeout(10000);
        env.request
            .post('/v1/uploads/12345/finalize')
            .set(env.AuthHeader)
            .expect(400)
            .end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                done();
            });
    });

    it('PUT /v1/uploads/{jobId} should return 400', function (done) {
        this.timeout(10000);
        const id = uuid.v4();
        env.request
            .put('/v1/uploads/' + id)
            .set(env.AuthHeader)
            .set({ 'Content-Type': 'application/json' })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                done();
            });
    });
});
