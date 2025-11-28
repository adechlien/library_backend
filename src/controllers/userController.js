import { db } from '../data/database.js';

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

export function getUserById(req, res) {
  const id = Number(req.params.id);

  const user = db.users.find(
    (u) => u.id === id && !u.isDisabled,
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json(sanitizeUser(user));
}

export function updateUser(req, res) {
  const id = Number(req.params.id);
  const authUser = req.user;

  const user = db.users.find((u) => u.id === id && !u.isDisabled);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isSelf = authUser && Number(authUser.id) === user.id;
  const canUpdateOthers = authUser?.permissions?.canUpdateUser;

  if (!isSelf && !canUpdateOthers) {
    return res.status(403).json({ error: 'Forbidden: cannot update this user' });
  }

  const { name, email, permissions } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;

  if (permissions) {
    if (!canUpdateOthers) {
      return res.status(403).json({
        error: 'Forbidden: cannot change permissions',
      });
    }
    user.permissions = {
      ...user.permissions,
      ...permissions,
    };
  }

  return res.status(200).json(sanitizeUser(user));
}

export function deleteUser(req, res) {
  const id = Number(req.params.id);
  const authUser = req.user;

  const user = db.users.find((u) => u.id === id && !u.isDisabled);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isSelf = authUser && Number(authUser.id) === user.id;
  const canDeleteOthers = authUser?.permissions?.canDeleteUser;

  if (!isSelf && !canDeleteOthers) {
    return res.status(403).json({ error: 'Forbidden: cannot delete this user' });
  }

  user.isDisabled = true;

  return res.status(200).json({ message: 'User soft-deleted' });
}
