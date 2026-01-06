// src/services/google-auth.service.js
import { OAuth2Client } from 'google-auth-library';
import * as users from '../repositories/user.repository.js';
import { generateToken } from './token.service.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLogin(pool, idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const providerId = payload.sub;

  let user = await users.findByProvider(pool, 'google', providerId);

  if (!user) {
    user = await users.createUser(pool, {
      email: payload.email,
      name: payload.name,
      passwordHash: null,
      provider: 'google',
      providerId,
      avatarUrl: payload.picture,
    });
  }

  return {
    user,
    token: generateToken(user),
  };
}
