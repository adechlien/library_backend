import { Router } from 'express';
import {
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { authRequired } from '../middlewares/authMiddleware.js';

const router = Router();

// READ Usuario (perfil) - sin auth obligatorio
router.get('/:id', getUserById);

// UPDATE Usuario - requiere auth (mismo usuario o permiso)
router.put('/:id', authRequired, updateUser);

// DELETE Usuario (soft delete) - requiere auth
router.delete('/:id', authRequired, deleteUser);

export default router;
