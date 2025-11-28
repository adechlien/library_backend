// tests/authController.test.js
import request from 'supertest';
import app from '../src/index.js';
import { db } from '../src/data/database.js';

beforeEach(() => {
  db.users.length = 0;
});

describe('Auth Controller', () => {
  it('registers a new user (success)', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'secret123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('fails to login with wrong credentials', async () => {
    // no user in db
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nope@example.com',
        password: 'wrong',
      });

    expect(res.statusCode).toBe(401);
  });
});
