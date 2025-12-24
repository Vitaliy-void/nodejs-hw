import createHttpError from 'http-errors';
import Note from '../models/note.js';

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

    const filter = { userId: req.user._id };

    if (tag) filter.tag = tag;

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

export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOne({ _id: noteId, userId: req.user._id });

    if (!note) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const deleted = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user._id,
    });

    if (!deleted) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(deleted);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const updated = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      req.body,
      { new: true },
    );

    if (!updated) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
