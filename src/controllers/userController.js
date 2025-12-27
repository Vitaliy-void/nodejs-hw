import createHttpError from 'http-errors';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import User from '../models/user.js';

export const updateUserAvatar = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw createHttpError(400, 'No file');
    }

    const uploadResult = await saveFileToCloudinary(req.file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: uploadResult.secure_url },
      { new: true },
    );

    res.status(200).json({ url: updatedUser.avatar });
  } catch (error) {
    next(error);
  }
};