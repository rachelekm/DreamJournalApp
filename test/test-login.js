'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Auth endpoints', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'exampleFirstName';
  const lastName = 'exmapleLastName';

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName
      })
    );
  });

  afterEach(function () {
    return User.find({username: 'exampleUser'}).remove();
  });

  describe('Login Functions', function () {
    it('Should reject requests with no credentials', function () {
      return chai.request(app)
        .post('/login')
        .send({username: 'newUsername', password: password})
        .then(function(res){
          expect(res).to.have.status(401);
        })
        .catch(err => {
          console.log(err);
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });

    it('Should reject requests with incorrect usernames', function () {
      return chai.request(app)
        .post('/login')
        .send({ username: 'wrongUsername', password })
        .then(function(res){
          expect(res).to.have.status(401);        
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
    it('Should reject requests with incorrect passwords', function () {
      return chai.request(app)
        .post('/login')
        .send({ username, password: 'wrongPassword' })
        .then(function(res){
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
    it('Should return a valid jwt token', function () {
      return chai.request(app)
        .post('/login')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
         expect(payload.user.username).to.equal(username);
         expect(payload.user.firstName).to.equal(firstName);
         expect(payload.user.lastName).to.equal(lastName);
        });
      });
    });

  describe('refresh login', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/login/refresh')
        .then(function(res){
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
    it('Should reject requests with an invalid token', function () {
      const token = jwt.sign(
        {
          username,
          firstName,
          lastName
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .post('/login/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(function(res){
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
    /*
    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          },
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: Math.floor(Date.now() / 1000) - 100
        }
      );

      return chai.request(app)
        .post('/login/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(function(res){
          expect(res).to.have.status(401);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });*/
    it('Should return a valid auth token with a newer expiry date', function () {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      const decoded = jwt.decode(token);

      return chai
        .request(app)
        .post('/login/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(payload.user.username).to.equal(username);
          expect(payload.user.firstName).to.equal(firstName);
          expect(payload.user.lastName).to.equal(lastName);
          });
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });
  });