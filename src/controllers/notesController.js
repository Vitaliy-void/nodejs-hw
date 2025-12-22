import createHttpError from 'http-errors';
import Note from '../models/note.js';

// GET /notes  (з пагінацією та фільтрацією)
export const getAllNotes = async (req, res, next) => {
  try {
    const {
      page = 1,
      perPage = 10,
      tag,
      search,
    } = req.query;

    const pageNum = Number(page) || 1;
    const limit = Number(perPage) || 10;
    const skip = (pageNum - 1) * limit;

    const filter = {};

    if (tag) {
      filter.tag = tag;
    }

    if (typeof search === 'string' && search.trim() !== '') {
      filter.$text = { $search: search.trim() };
    }

    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter).skip(skip).limit(limit),
    ]);

    const totalPages = Math.ceil(totalNotes / limit) || 1;

    res.status(200).json({
      page: pageNum,
      perPage: limit,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

// GET /notes/:noteId
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// POST /notes
export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// DELETE /notes/:noteId
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const deleted = await Note.findByIdAndDelete(noteId);

    if (!deleted) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(deleted);
  } catch (error) {
    next(error);
  }
};

// PATCH /notes/:noteId
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const updated = await Note.findByIdAndUpdate(noteId, req.body, {
      new: true,
    });

    if (!updated) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
