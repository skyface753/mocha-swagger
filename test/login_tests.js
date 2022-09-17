const expect = require('chai').expect;
const uuid = require('node-uuid');
const env = {
  request: 'get_env',
  AuthHeader: 'auth_token',
};

describe.skip('Login Tests', () => {
  it('POST success login a user', function (done) {
    this.timeout(10000);
    env.request
      .post('/api/v1/login')
      .set(env.AuthHeader)
      .expect(200)
      .send({
        email: 'test@test.de',
        password: 'test',
      })

      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.be.true;
        expect(res.body.message).to.equal('Login successful');
        expect(res.body.user).to.be.an('object');
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
  it('POST error login a user', function (done) {
    this.timeout(10000);
    env.request
      .post('/api/v1/login')
      .set(env.AuthHeader)
      .expect(400)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.success).to.be.false;
        expect(res.body.message).to.equal('Login failed');
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });

  it('POST success login an admin', function (done) {
    this.timeout(10000);
    env.request
      .post('/api/v1/login')
      .set(env.AuthHeader)
      .expect(200)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.be.true;
        expect(res.body.message).to.equal('Login successful');
        expect(res.body.user).to.be.an('object');
        expect(res.body.user.isAdmin).to.be.true;
        if (err) {
          done(err);
          return;
        }
        done();
      });
  });
});
