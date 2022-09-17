const expect = require('chai').expect;
const uuid = require('node-uuid');
const env = {
  request: 'get_env',
  AuthHeader: 'auth_token',
};

describe.skip('Proxy Tests', () => {
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

  it('PUT /v2/uploads/{jobId} should return 400', function (done) {
    this.timeout(10000);
    const id = uuid.v4();
    env.request
      .put('/v2/uploads2/' + id)
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

  it('PUT /v3/uploads/{jobId} should return 400', function (done) {
    this.timeout(10000);
    const id = uuid.v4();
    env.request
      .put('/v3/uploads3/' + id)
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
