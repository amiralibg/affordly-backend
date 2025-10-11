import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
