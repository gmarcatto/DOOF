import { Router } from 'express';
import passport from 'passport';
import { register, login, getProfile, oauthCallback, firebaseAuth } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Local authentication
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

// Firebase authentication
router.post('/firebase', firebaseAuth);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }),
  oauthCallback
);

// Facebook OAuth
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

export default router;

