import { Router } from 'express';
import {
  createReservation,
  getReservationsByBook,
  getReservationsByUser,
} from '../controllers/reservationController.js';
import { authRequired } from '../middlewares/authMiddleware.js';

const router = Router();

// Crear reserva (requiere usuario autenticado)
router.post('/', authRequired, createReservation);

// Historial de un libro
router.get('/book/:bookId', authRequired, getReservationsByBook);

// Historial de un usuario
router.get('/user/:userId', authRequired, getReservationsByUser);

export default router;
