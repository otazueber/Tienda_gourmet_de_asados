const chai = require('chai');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing Sessions API Endpoints', () => {
  let authToken;

  before(() => {
    authToken = jwt.sign({ email: 'otazueber@gmail.com', role: 'user' }, 'jwtSecret', { expiresIn: '1h' });
  });

  it('01 - Debería obtener el usuario actual con un token de autenticación válido', async () => {
    const res = await requester
      .get('/api/sessions/current')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).to.have.property('email');
    expect(res.body).to.have.property('role');
  });

  it('02 - Debería devolver 403 Forbidden con token de autenticación no válido', async () => {
    await requester
      .get('/api/sessions/current')
      .set('Authorization', 'Bearer invalid_token')
      .expect(403);
  });

  it('03 - Debería devolver 401 No autorizado sin token de autenticación', async () => {
    await requester.get('/api/sessions/current').expect(401);
  });
});
