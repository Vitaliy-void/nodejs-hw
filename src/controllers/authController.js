import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import handlebars from 'handlebars';

import User from '../models/user.js';
import Session from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendMail } from '../utils/sendMail.js';

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(400, 'Email in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: passwordHash,
    });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid credentials');
    }

    await Session.deleteMany({ userId: user._id });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies || {};

    const session = await Session.findOne({ _id: sessionId, refreshToken });
    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    if (session.refreshTokenValidUntil < new Date()) {
      throw createHttpError(401, 'Session token expired');
    }

    const userId = session.userId;

    await Session.deleteOne({ _id: session._id });

    const newSession = await createSession(userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies || {};

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ message: 'Password reset email sent successfully' });
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

    const templatePath = new URL(
      '../templates/reset-password-email.html',
      import.meta.url,
    );

    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    const html = template({
      username: user.username || user.email,
      resetLink,
    });

        try {
    await sendMail({
        to: user.email,
        subject: 'Password reset',
        html,
    });
    } catch {
    throw createHttpError(
        500,
        'Failed to send the email, please try again later.',
    );
    }

    res
      .status(200)
      .json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw createHttpError(401, 'Invalid or expired token');
    }

    const { sub, email } = payload;

    const user = await User.findOne({ _id: sub, email });
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.password = passwordHash;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
