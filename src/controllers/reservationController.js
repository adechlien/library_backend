import { db, nextId } from '../data/database.js';
import { createReservationModel } from '../models/reservationModel.js';

export function createReservation(req, res) {
  try {
    const { bookId } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!bookId) {
      return res.status(400).json({ error: 'bookId is required' });
    }

    const book = db.books.find(
      (b) => b.id === Number(bookId) && !b.isDisabled,
    );
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!book.isAvailable) {
      return res.status(400).json({ error: 'Book is not available' });
    }

    const reservation = createReservationModel({
      userId: Number(user.id),
      bookId: Number(bookId),
    });
    reservation.id = nextId('reservation');

    db.reservations.push(reservation);
    book.isAvailable = false; // lo reservas

    return res.status(201).json(reservation);
  } catch (err) {
    console.error('createReservation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export function getReservationsByBook(req, res) {
  const bookId = Number(req.params.bookId);

  const reservations = db.reservations
    .filter((r) => r.bookId === bookId)
    .map((r) => {
      const user = db.users.find((u) => u.id === r.userId);
      return {
        id: r.id,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
            }
          : null,
        reservedAt: r.reservedAt,
        deliveredAt: r.deliveredAt,
      };
    });

  return res.status(200).json(reservations);
}

export function getReservationsByUser(req, res) {
  const userId = Number(req.params.userId);

  const reservations = db.reservations
    .filter((r) => r.userId === userId)
    .map((r) => {
      const book = db.books.find((b) => b.id === r.bookId);
      return {
        id: r.id,
        book: book
          ? {
              id: book.id,
              title: book.title,
            }
          : null,
        reservedAt: r.reservedAt,
        deliveredAt: r.deliveredAt,
      };
    });

  return res.status(200).json(reservations);
}
