// lib/verifyToken.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function verifyToken(authorization?: string): null | { id: number; email: string; role: string } {
  if (!authorization || !authorization.startsWith('Bearer ')) return null;

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    return decoded;
  } catch (err) {
    return null;
  }
}
