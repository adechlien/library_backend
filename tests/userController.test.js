// tests/userController.test.js
import request from 'supertest';
import app from '../src/index.js';
import { db, nextId } from '../src/data/database.js';
import bcrypt from 'bcryptjs';
import { createUserModel } from '../src/models/userModel.js';

async function createUserAndToken({ email, password, permissions = {} }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = createUserModel({
    name: email.split('@')[0],
    email,
    passwordHash,
    permissions,
  });

  user.id = nextId('user');
  db.users.push(user);

  const loginRes = await request(app)
    .post('/auth/login')
    .send({ email, password });

  return { token: loginRes.body.token, user };
}

beforeEach(() => {
  // limpiar "BD" en memoria antes de cada test
  db.users.length = 0;
  db.books.length = 0;
  db.reservations.length = 0;
  db.counters.user = 1;
  db.counters.book = 1;
  db.counters.reservation = 1;
});

describe('User Controller', () => {
  describe('GET /users/:id', () => {
    it('returns a user when it exists (success case)', async () => {
      const { user } = await createUserAndToken({
        email: 'user1@test.com',
        password: 'userpass',
      });

      const res = await request(app).get(`/users/${user.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', user.id);
      expect(res.body).toHaveProperty('email', 'user1@test.com');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('returns 404 when user does not exist', async () => {
      const res = await request(app).get('/users/9999');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('updates own profile when authenticated (success case)', async () => {
      const { token, user } = await createUserAndToken({
        email: 'user2@test.com',
        password: 'userpass',
      });

      const res = await request(app)
        .put(`/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nuevo Nombre' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Nuevo Nombre');
    });

    it('returns 403 when trying to update another user without permission', async () => {
      const { user: userA } = await createUserAndToken({
        email: 'userA@test.com',
        password: 'passA',
      });

      const { token: tokenB } = await createUserAndToken({
        email: 'userB@test.com',
        password: 'passB',
      });

      const res = await request(app)
        .put(`/users/${userA.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hackeado' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /users/:id', () => {
    it('soft deletes own user (success case)', async () => {
      const { token, user } = await createUserAndToken({
        email: 'user3@test.com',
        password: 'userpass',
      });

      const res = await request(app)
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'User soft-deleted');

      const found = db.users.find((u) => u.id === user.id);
      expect(found.isDisabled).toBe(true);
    });

    it('returns 403 when trying to delete another user without permission', async () => {
      const { user: userA } = await createUserAndToken({
        email: 'userA2@test.com',
        password: 'passA2',
      });

      const { token: tokenB } = await createUserAndToken({
        email: 'userB2@test.com',
        password: 'passB2',
      });

      const res = await request(app)
        .delete(`/users/${userA.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
