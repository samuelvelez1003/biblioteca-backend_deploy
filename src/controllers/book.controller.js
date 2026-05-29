import Book from "../models/book.model.js";

const mapOpenLibraryBook = (book) => ({
  titulo: book.title || "Sin titulo",
  autor: book.author_name?.[0] || "Autor desconocido",
  anio: book.first_publish_year || null,
  isbn: book.isbn?.[0] || null,
  categoria: book.subject?.[0] || "General",
  descripcion: book.first_sentence?.[0] || "Libro consultado desde Open Library",
  cantidad: 1,
  portada: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
  fuente: "openlibrary",
});

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener libros" });
  }
};

export const buscarLibros = async (req, res) => {
  try {
    const { q = "" } = req.query;

    if (!q.trim()) {
      return res.json([]);
    }

    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20`
    );

    const data = await response.json();
    const libros = (data.docs || []).slice(0, 20).map(mapOpenLibraryBook);

    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: "Error consultando Open Library" });
  }
};

export const createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ message: "Libro guardado", book });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar libro", error: error.message });
  }
};

export const saveExternalBook = async (req, res) => {
  try {
    const { titulo, autor, isbn } = req.body;

    const existing = await Book.findOne({
      $or: [
        ...(isbn ? [{ isbn }] : []),
        { titulo, autor },
      ],
    });

    if (existing) {
      existing.cantidad += Number(req.body.cantidad || 1);
      await existing.save();
      return res.json({ message: "El libro ya existia. Se actualizo la cantidad", book: existing });
    }

    const book = await Book.create({
      titulo,
      autor,
      anio: req.body.anio || null,
      isbn: isbn || null,
      categoria: req.body.categoria || "General",
      descripcion: req.body.descripcion || "Sin descripcion",
      cantidad: Number(req.body.cantidad || 1),
      portada: req.body.portada || null,
      fuente: req.body.fuente || "openlibrary",
    });

    res.status(201).json({ message: "Libro guardado", book });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar libro", error: error.message });
  }
};
