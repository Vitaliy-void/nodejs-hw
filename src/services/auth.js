import crypto from 'crypto';
import Session from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

export const createSession = async (userId) => {
  const accessToken = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();

  const now = Date.now();

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + ONE_DAY),
  });

  return session;
};

const cookieOptionsAccess = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: FIFTEEN_MINUTES,
};

const cookieOptionsRefresh = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: ONE_DAY,
};

export const setSessionCookies = (res, session) => {
  res.cookie('accessToken', session.accessToken, cookieOptionsAccess);
  res.cookie('refreshToken', session.refreshToken, cookieOptionsRefresh);
  res.cookie('sessionId', session._id.toString(), cookieOptionsRefresh);
};