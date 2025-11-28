export function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const perms = req.user.permissions || {};
    if (!perms[permissionKey]) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    return next();
  };
}
