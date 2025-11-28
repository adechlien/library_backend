// src/data/database.js

// "Base de datos" en memoria
export const db = {
  users: [],
  books: [],
  reservations: [],
  counters: {
    user: 1,
    book: 1,
    reservation: 1,
  },
};

// Generador sencillo de IDs incrementales por tipo
export function nextId(entity) {
  if (!db.counters[entity]) {
    db.counters[entity] = 1;
  }

  const current = db.counters[entity];
  db.counters[entity] = current + 1;
  return current;
}
