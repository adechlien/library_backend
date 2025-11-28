export function createReservationModel({
  userId,
  bookId,
  reservedAt = new Date(),
  deliveredAt = null,
}) {
  return {
    id: null,
    userId,
    bookId,
    reservedAt,
    deliveredAt,
  };
}
