// tests/reservationController.test.js
import request from 'supertest';
import app from '../src/index.js';
import { db, nextId } from '../src/data/database.js';
import bcrypt from 'bcryptjs';
import { createUserModel } from '../src/models/userModel.js';

async function createUserAndToken() {
  const passwordHash = await bcrypt.hash('userpass', 10);
  const user = createUserModel({
    name: 'User',
    email: 'user@test.com',
    passwordHash,
  });
  user.id = nextId('user');
  db.users.push(user);

  const loginRes = await request(app)
    .post('/auth/login')
    .send({ email: 'user@test.com', password: 'userpass' });

  return { token: loginRes.body.token, user };
}

beforeEach(() => {
  db.users.length = 0;
  db.books.length = 0;
  db.reservations.length = 0;
});

describe('Reservation Controller', () => {
  it('creates a reservation for an available book', async () => {
    const { token, user } = await createUserAndToken();

    const bookId = nextId('book');
    db.books.push({
      id: bookId,
      title: 'Reservable Book',
      author: 'Someone',
      isDisabled: false,
      isAvailable: true,
    });

    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBe(user.id);
  });

  it('returns reservations by user', async () => {
    const { token, user } = await createUserAndToken();

    // crear libro + reserva "a mano"
    const bookId = nextId('book');
    db.books.push({
      id: bookId,
      title: 'Book',
      author: 'X',
      isDisabled: false,
      isAvailable: false,
    });

    db.reservations.push({
      id: nextId('reservation'),
      userId: user.id,
      bookId,
      reservedAt: new Date().toISOString(),
      deliveredAt: null,
    });

    const res = await request(app)
      .get(`/reservations/user/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
