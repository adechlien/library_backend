// tests/bookController.test.js
import request from 'supertest';
import app from '../src/index.js';
import { db } from '../src/data/database.js';
import bcrypt from 'bcryptjs';
import { createUserModel } from '../src/models/userModel.js';
import { nextId } from '../src/data/database.js';

async function createAdminAndToken() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = createUserModel({
    name: 'Admin',
    email: 'admin@test.com',
    passwordHash,
    permissions: {
      canCreateBook: true,
      canUpdateBook: true,
      canDeleteBook: true,
    },
  });
  admin.id = nextId('user');
  db.users.push(admin);

  const loginRes = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });

  return loginRes.body.token;
}

beforeEach(() => {
  db.users.length = 0;
  db.books.length = 0;
});

describe('Book Controller', () => {
  it('returns paginated list of books (success)', async () => {
    // pre-carga de libros
    db.books.push(
      { id: 1, title: 'Book 1', isDisabled: false },
      { id: 2, title: 'Book 2', isDisabled: false },
    );

    const res = await request(app).get('/books?page=1&limit=1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('fails to create book without permissions', async () => {
    const res = await request(app)
      .post('/books')
      .send({ title: 'New Book', author: 'Me' });

    expect(res.statusCode).toBe(401);
  });

  it('creates a book with admin token', async () => {
    const token = await createAdminAndToken();

    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Book', author: 'Me' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
