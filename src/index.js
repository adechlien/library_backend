import express from 'express';
import bcrypt from 'bcryptjs';

import { db, nextId } from './data/database.js';
import { createUserModel } from './models/userModel.js';
import { config } from './config/env.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'sanito, todo bien' });
});

async function seedAdmin() {
  const alreadyExists = db.users.some(
    (u) => u.email === 'admin@admin.com' && !u.isDisabled,
  );
  if (alreadyExists) return;

  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = createUserModel({
    name: 'Admin',
    email: 'admin@admin.com',
    passwordHash,
    permissions: {
      canCreateBook: true,
      canUpdateBook: true,
      canDeleteBook: true,
      canUpdateUser: true,
      canDeleteUser: true,
      canReadUsers: true,
    },
  });

  admin.id = nextId('user');
  db.users.push(admin);

  console.log('✅ Admin user seeded: admin@admin.com / 123456');
}

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use('/reservations', reservationRoutes);

if (process.env.NODE_ENV !== 'test') {
  seedAdmin().then(() => {
    app.listen(config.port, () => {
      console.log(`📚 API running on http://localhost:${config.port}`);
    });
  });
}

export default app;
