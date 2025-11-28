import { Router } from 'express';
import {
  createBook,
  getBookById,
  getBooks,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { authRequired } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionsMiddleware.js';

const router = Router();

// CREATE Libro - solo con permiso
router.post(
  '/',
  authRequired,
  requirePermission('canCreateBook'),
  createBook,
);

// READ Libro individual
router.get('/:id', getBookById);

// READ Libros (*) con filtros + paginación
router.get('/', getBooks);

// UPDATE Libro - solo con permiso
router.put(
  '/:id',
  authRequired,
  requirePermission('canUpdateBook'),
  updateBook,
);

// DELETE Libro (soft) - solo con permiso
router.delete(
  '/:id',
  authRequired,
  requirePermission('canDeleteBook'),
  deleteBook,
);

export default router;
