// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, nextId } from '../data/database.js';
import { createUserModel } from '../models/userModel.js';
import { config } from '../config/env.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = db.users.find(
      (u) => u.email === email && !u.isDisabled,
    );
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = createUserModel({
      name,
      email,
      passwordHash,
    });
    user.id = nextId('user');

    db.users.push(user);

    const { passwordHash: _, ...safeUser } = user;
    return res.status(201).json(safeUser);
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = db.users.find(
      (u) => u.email === email && !u.isDisabled,
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      permissions: user.permissions,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    const { passwordHash: _, ...safeUser } = user;

    return res.status(200).json({ token, user: safeUser });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
