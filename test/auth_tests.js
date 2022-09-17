let chai = require('chai');
let chaiHttp = require('chai-http');
const { describe } = require('mocha');
let expect = chai.expect;
// let should = chai.should();
let server = require('../index');

chai.use(chaiHttp);

const credentials = require('./credentials.json');

describe('Login', () => {
  it('POST /api/login should return 200', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        email: credentials.user.email,
        password: credentials.user.password,
      })

      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.user.roleFk).to.equal(1);
        expect(res.body.data.user.email).to.equal(credentials.user.email);
        expect(res.body.data.user).to.have.property('id');
        expect(res.body.data.user).to.have.property('avatarPath');
        done();
      });
  });
  it('it should not login a user with wrong email', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        email: 'notAMail@example.de',
        password: credentials.user.password,
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.success).to.be.false;
        done();
      });
  });
  it('it should not login a user with wrong password', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        email: credentials.user.email,
        password: 'wrongPassword',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.success).to.be.false;
        done();
      });
  });
  it('it should login a user with admin role', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        email: credentials.admin.email,
        password: credentials.admin.password,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.user.roleFk).to.equal(2);
        done();
      });
  });
  // Login Admin Fail handled in user login fail
});

// DB Service to delete registered user
const db = require('../services/db');

describe('Register', () => {
  describe('/POST register-user-success', () => {
    it('it should register a user with user role', (done) => {
      chai
        .request(server)
        .put('/api/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          email: credentials.newUser.email,
          password: credentials.newUser.password,
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          expect(res.body.data.user.roleFk).to.equal(1);
          done();
        });
    });
  });
  describe('/POST register-user-fail', () => {
    it('it should not register a user with existing email', (done) => {
      after(async () => {
        await db.query('DELETE FROM user WHERE email = ?', [
          credentials.newUser.email,
        ]);
      });
      chai
        .request(server)
        .put('/api/register')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          email: credentials.newUser.email, // Existing email
          password: credentials.newUser.password,
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.success).to.be.false;
          done();
        });
    });
  });
});

describe('Logout', () => {
  describe('/POST logout-success', () => {
    it('it should logout a user', (done) => {
      chai
        .request(server)
        .post('/api/logout')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send()
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          done();
        });
    });
  });
});

describe('Status Check', () => {
  describe('/GET status-check-success-user', () => {
    var cookie;
    before((done) => {
      chai
        .request(server)
        .post('/api/login')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          email: credentials.user.email,
          password: credentials.user.password,
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          cookie = res.headers['set-cookie'];
          done();
        });
    });
    it('it should check the status of the USER-login', (done) => {
      chai
        .request(server)
        .get('/api/user/status')
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Cookie', cookie)
        .send()
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          expect(res.body.data.user.roleFk).to.equal(1);
          done();
        });
    });
  });
  // Admin Test
  describe('/GET status-check-success-admin', () => {
    var cookie;
    before((done) => {
      chai
        .request(server)
        .post('/api/login')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          email: credentials.admin.email,
          password: credentials.admin.password,
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          cookie = res.headers['set-cookie'];
          done();
        });
    });
    it('it should check the status of the ADMIN-login', (done) => {
      chai
        .request(server)
        .get('/api/user/status')
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Cookie', cookie)
        .send()
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.success).to.be.true;
          expect(res.body.data.user.roleFk).to.equal(2);
          done();
        });
    });
  });
  describe('/GET status-check-fail', () => {
    it('it should deny the status-check because no jwt cookie is present', (done) => {
      chai
        .request(server)
        .get('/api/user/status')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send()
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.success).to.be.false;
          done();
        });
    });
  });
});
