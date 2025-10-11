import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔑 Authenticate - Token recebido:', token ? 'SIM' : 'NÃO');

    if (!token) {
      console.log('❌ Nenhum token no header Authorization');
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      userId: string;
    };
    console.log('🔑 Token decodificado - userId:', decoded.userId);

    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('❌ Usuário não encontrado no banco:', decoded.userId);
      res.status(401).json({ error: 'User not found' });
      return;
    }

    console.log('✅ Usuário autenticado:', user.email);
    req.user = user;
    next();
  } catch (error: any) {
    console.log('❌ Erro ao validar token:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

