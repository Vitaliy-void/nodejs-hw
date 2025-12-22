import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

import {
  validateGetAllNotes,
  validateNoteId,
  validateCreateNote,
  validateUpdateNote,
} from '../validations/notesValidation.js';

const router = Router();

router.get('/notes', validateGetAllNotes, getAllNotes);
router.get('/notes/:noteId', validateNoteId, getNoteById);
router.post('/notes', validateCreateNote, createNote);
router.delete('/notes/:noteId', validateNoteId, deleteNote);
router.patch('/notes/:noteId', validateUpdateNote, updateNote);

export default router;
