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
        // Verificar se o restaurante não tem owner ou se o owner é diferente deste usuário
        if (!restaurant.owner || restaurant.owner.toString() !== user._id.toString()) {
          console.log('🏪 Restaurante encontrado:', restaurant.name);
          restaurant.owner = user._id;
          await restaurant.save();
          console.log('✅ Restaurante associado ao usuário:', user.email);
        } else {
          console.log('✅ Restaurante já está associado a este usuário');
        }
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
      console.log('🔍 Buscando restaurante com email:', email);
      const restaurant = await Restaurant.findOne({ email });
      
      if (restaurant) {
        // Verificar se o restaurante não tem owner ou se o owner é diferente deste usuário
        if (!restaurant.owner || restaurant.owner.toString() !== user._id.toString()) {
          console.log('🏪 Associando restaurante ao usuário no login:', restaurant.name);
          restaurant.owner = user._id;
          await restaurant.save();
          console.log('✅ Restaurante associado:', user.email);
        } else {
          console.log('✅ Restaurante já está associado a este usuário');
        }
      } else {
        console.log('⚠️ Nenhum restaurante encontrado com email:', email);
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

export const firebaseAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firebaseIdToken, name, email, phone, firebaseUid } = req.body;

    if (!firebaseIdToken || !email) {
      res.status(400).json({ error: 'Firebase ID token and email are required' });
      return;
    }

    // Verificar o token do Firebase (em produção, você deve verificar o token no backend)
    // Por enquanto, vamos confiar no token e criar/buscar o usuário
    // TODO: Adicionar verificação do token Firebase usando admin SDK

    console.log('🔵 Firebase Auth - Email:', email, 'UID:', firebaseUid);
    
    // Validar se firebaseUid não é um token JWT (deve ser apenas o UID)
    let validFirebaseUid = firebaseUid;
    if (firebaseUid && firebaseUid.length > 50) {
      // Se parece ser um token JWT, tentar extrair o UID
      try {
        const parts = firebaseUid.split('.');
        if (parts.length === 3) {
          // É um JWT, tentar decodificar
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          validFirebaseUid = payload.user_id || payload.sub || null;
          console.log('🔵 UID extraído do token:', validFirebaseUid);
        }
      } catch (e) {
        console.log('⚠️ Não foi possível extrair UID do token, usando como está');
      }
    }
    
    // Buscar usuário existente por email ou firebaseUid
    let user = await User.findOne({ 
      $or: [
        { email },
        ...(validFirebaseUid ? [{ firebaseUid: validFirebaseUid }] : [])
      ]
    });

    if (!user) {
      console.log('🔵 Criando novo usuário Firebase...');
      // Criar novo usuário
      user = await User.create({
        name: name || 'Usuário',
        email,
        phone: phone || '',
        role: 'customer',
        authProvider: 'firebase',
        ...(validFirebaseUid ? { firebaseUid: validFirebaseUid } : {}),
      });
      console.log('✅ Novo usuário Firebase criado:', user._id);
    } else {
      console.log('✅ Usuário Firebase encontrado:', user._id);
      // Atualizar dados se necessário
      if (name && user.name !== name) {
        user.name = name;
      }
      if (phone && user.phone !== phone) {
        user.phone = phone;
      }
      if (user.authProvider !== 'firebase') {
        user.authProvider = 'firebase';
      }
      if (validFirebaseUid && !user.firebaseUid) {
        user.firebaseUid = validFirebaseUid;
      }
      await user.save();
    }

    const token = generateToken(user._id.toString());

    res.json({
      message: 'Firebase authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.log('❌ Erro no Firebase Auth:', error);
    res.status(500).json({ error: error.message });
  }
};

