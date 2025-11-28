export function createBookModel({
  title,
  author,
  genre,
  publisher,
  publicationDate,
}) {
  return {
    id: null,
    title,
    author,
    genre,
    publisher,
    publicationDate,
    isAvailable: true,
    isDisabled: false,
  };
}
