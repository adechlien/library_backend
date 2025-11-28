import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization || req.headers.Authorization;

  if (!header || typeof header !== 'string') {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  if (!header.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Invalid Authorization format' });
  }

  const token = header.slice(7).trim();

  try {
    const payload = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: payload.sub,
      email: payload.email,
      permissions: payload.permissions || {},
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
