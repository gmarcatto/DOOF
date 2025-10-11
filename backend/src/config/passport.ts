import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User, { IUser } from '../models/User';

export const configurePassport = (): void => {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log('🔵 Google OAuth - Profile recebido:', profile.emails?.[0]?.value);
            
            let user = await User.findOne({ 
              authProvider: 'google', 
              providerId: profile.id 
            });

            if (!user) {
              console.log('🔵 Usuário não existe, verificando email...');
              // Check if user exists with same email
              user = await User.findOne({ 
                email: profile.emails?.[0]?.value 
              });

              if (user) {
                console.log('✅ Usuário existe com email, atualizando para Google auth');
                // Update existing user with Google auth
                user.authProvider = 'google';
                user.providerId = profile.id;
                user.avatar = profile.photos?.[0]?.value;
                await user.save();
                console.log('✅ Usuário atualizado:', user._id);
              } else {
                console.log('🔵 Criando novo usuário...');
                // Create new user
                user = await User.create({
                  name: profile.displayName,
                  email: profile.emails?.[0]?.value,
                  avatar: profile.photos?.[0]?.value,
                  authProvider: 'google',
                  providerId: profile.id,
                  role: 'customer',
                });
                console.log('✅ Novo usuário criado:', user._id);
              }
            } else {
              console.log('✅ Usuário já existe:', user._id);
            }

            return done(null, user);
          } catch (error: any) {
            console.log('❌ Erro no Google OAuth:', error.message);
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ 
              authProvider: 'facebook', 
              providerId: profile.id 
            });

            if (!user) {
              // Check if user exists with same email
              user = await User.findOne({ 
                email: profile.emails?.[0]?.value 
              });

              if (user) {
                // Update existing user with Facebook auth
                user.authProvider = 'facebook';
                user.providerId = profile.id;
                user.avatar = profile.photos?.[0]?.value;
                await user.save();
              } else {
                // Create new user
                user = await User.create({
                  name: `${profile.name?.givenName} ${profile.name?.familyName}`,
                  email: profile.emails?.[0]?.value,
                  avatar: profile.photos?.[0]?.value,
                  authProvider: 'facebook',
                  providerId: profile.id,
                  role: 'customer',
                });
              }
            }

            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

