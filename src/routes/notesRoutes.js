import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get(
  '/notes',
  authenticate,
  celebrate(getAllNotesSchema),
  getAllNotes,
);

router.get(
  '/notes/:noteId',
  authenticate,
  celebrate(noteIdSchema),
  getNoteById,
);

router.post(
  '/notes',
  authenticate,
  celebrate(createNoteSchema),
  createNote,
);

router.delete(
  '/notes/:noteId',
  authenticate,
  celebrate(noteIdSchema),
  deleteNote,
);

router.patch(
  '/notes/:noteId',
  authenticate,
  celebrate(updateNoteSchema),
  updateNote,
);

export default router;