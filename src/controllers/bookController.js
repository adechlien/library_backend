import { db, nextId } from '../data/database.js';
import { createBookModel } from '../models/bookModel.js';

export function createBook(req, res) {
  try {
    const { title, author, genre, publisher, publicationDate } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'title and author are required' });
    }

    const book = createBookModel({
      title,
      author,
      genre: genre ?? null,
      publisher: publisher ?? null,
      publicationDate: publicationDate ?? null,
    });

    book.id = nextId('book');
    db.books.push(book);

    return res.status(201).json(book);
  } catch (err) {
    console.error('createBook error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export function getBookById(req, res) {
  const id = Number(req.params.id);

  const book = db.books.find(
    (b) => b.id === id && !b.isDisabled,
  );

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  return res.status(200).json(book);
}

export function getBooks(req, res) {
  let {
    genre,
    publisher,
    author,
    title,
    available,
    fromDate,
    toDate,
    page = '1',
    limit = '10',
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (Number.isNaN(page) || page <= 0 || Number.isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  let results = db.books.filter((b) => !b.isDisabled);

  if (genre) {
    results = results.filter(
      (b) => (b.genre || '').toLowerCase() === String(genre).toLowerCase(),
    );
  }

  if (publisher) {
    const p = String(publisher).toLowerCase();
    results = results.filter(
      (b) => (b.publisher || '').toLowerCase().includes(p),
    );
  }

  if (author) {
    const a = String(author).toLowerCase();
    results = results.filter(
      (b) => (b.author || '').toLowerCase().includes(a),
    );
  }

  if (title) {
    const t = String(title).toLowerCase();
    results = results.filter(
      (b) => (b.title || '').toLowerCase().includes(t),
    );
  }

  if (available !== undefined) {
    const bool = String(available).toLowerCase() === 'true';
    results = results.filter((b) => b.isAvailable === bool);
  }

  if (fromDate) {
    const from = new Date(fromDate);
    if (!Number.isNaN(from.getTime())) {
      results = results.filter((b) => {
        if (!b.publicationDate) return false;
        const d = new Date(b.publicationDate);
        return d >= from;
      });
    }
  }

  if (toDate) {
    const to = new Date(toDate);
    if (!Number.isNaN(to.getTime())) {
      results = results.filter((b) => {
        if (!b.publicationDate) return false;
        const d = new Date(b.publicationDate);
        return d <= to;
      });
    }
  }

  const totalItems = results.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const offset = (page - 1) * limit;

  const pageItems = results.slice(offset, offset + limit);

  return res.status(200).json({
    data: pageItems.map((b) => ({ id: b.id, title: b.title })),
    pagination: {
      page,
      totalPages,
      limit,
      totalItems,
    },
  });
}

export function updateBook(req, res) {
  const id = Number(req.params.id);

  const book = db.books.find(
    (b) => b.id === id && !b.isDisabled,
  );

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const { title, author, genre, publisher, publicationDate, isAvailable } = req.body;

  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (genre !== undefined) book.genre = genre;
  if (publisher !== undefined) book.publisher = publisher;
  if (publicationDate !== undefined) book.publicationDate = publicationDate;
  if (isAvailable !== undefined) book.isAvailable = Boolean(isAvailable);

  return res.status(200).json(book);
}

export function deleteBook(req, res) {
  const id = Number(req.params.id);

  const book = db.books.find(
    (b) => b.id === id && !b.isDisabled,
  );

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  book.isDisabled = true;

  return res.status(200).json({ message: 'Book soft-deleted' });
}
