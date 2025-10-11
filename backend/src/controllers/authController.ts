import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import { AuthRequest } from '../middleware/auth';

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      authProvider: 'local',
    });

    if (user.role === 'restaurant') {
      console.log('🔍 Buscando restaurante com email:', email);
      const restaurant = await Restaurant.findOne({ email });
      
      if (restaurant) {
        console.log('🏪 Restaurante encontrado:', restaurant.name);
        restaurant.owner = user._id;
        await restaurant.save();
        console.log('✅ Restaurante associado ao usuário:', user.email);
      } else {
        console.log('⚠️ Nenhum restaurante encontrado com este email');
      }
    }

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.authProvider !== 'local') {
      res.status(401).json({ 
        error: `Please login with ${user.authProvider}` 
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ email, owner: { $exists: false } });
      
      if (restaurant) {
        console.log('🏪 Associando restaurante ao usuário no login:', restaurant.name);
        restaurant.owner = user._id;
        await restaurant.save();
        console.log('✅ Restaurante associado:', user.email);
      }
    }

    const token = generateToken(user._id.toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('📥 GET Profile - req.user:', req.user ? 'EXISTS' : 'NULL');
    
    if (!req.user) {
      console.log('❌ Usuário não autenticado');
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    console.log('✅ Retornando perfil de:', req.user.email);

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address,
        role: req.user.role,
        avatar: req.user.avatar,
      },
    });
  } catch (error: any) {
    console.log('❌ Erro em getProfile:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const oauthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔵 OAuth Callback recebido');
    const user = req.user as any;
    console.log('🔵 Usuário do OAuth:', user ? user.email : 'NENHUM');
    
    if (!user) {
      console.log('❌ Nenhum usuário autenticado pelo OAuth');
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendURL}/login?error=authentication_failed`);
      return;
    }
    
    const token = generateToken(user._id.toString());
    console.log('✅ Token JWT gerado para:', user.email);
    
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectURL = `${frontendURL}/auth/callback?token=${token}`;
    console.log('🔵 Redirecionando para:', redirectURL);
    res.redirect(redirectURL);
  } catch (error: any) {
    console.log('❌ Erro no OAuth callback:', error);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/login?error=server_error`);
  }
};

