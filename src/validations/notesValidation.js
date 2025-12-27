import { celebrate, Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../constants/tags.js';

export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...TAGS),
    search: Joi.string().allow(''),
  }),
};

const objectIdValidator = Joi.string().custom((value, helpers) => {
  if (!isValidObjectId(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'Mongo ObjectId validation');

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: objectIdValidator.required(),
  }),
};

export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow(''),
    tag: Joi.string().valid(...TAGS),
  }),
};

export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: objectIdValidator.required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1),
    content: Joi.string().allow(''),
    tag: Joi.string().valid(...TAGS),
  }).or('title', 'content', 'tag'),
};

export const validateGetAllNotes = celebrate(getAllNotesSchema);
export const validateNoteId = celebrate(noteIdSchema);
export const validateCreateNote = celebrate(createNoteSchema);
export const validateUpdateNote = celebrate(updateNoteSchema);
