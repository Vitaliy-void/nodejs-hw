import Note from '../models/note.js';

// GET /notes
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
