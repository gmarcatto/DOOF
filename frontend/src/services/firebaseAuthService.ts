import { 
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface OTPResult {
  success: boolean;
  message: string;
  email?: string;
}

export interface VerifyOTPResult {
  success: boolean;
  user: FirebaseUser | null;
  error?: string;
}

/**
 * Envia código OTP para o email usando Firebase Email Link Authentication
 * Nota: Firebase não tem OTP direto, mas podemos usar Email Link que é similar
 * Para OTP real, seria necessário usar Firebase Phone Auth ou implementar custom
 * Mas seguindo o requisito, vamos usar Email Link que é o mais próximo
 */
export const sendOTP = async (email: string): Promise<OTPResult> => {
  try {
    const actionCodeSettings = {
      // URL que será aberta quando o usuário clicar no link do email
      url: `${window.location.origin}/auth/verify-email`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    return {
      success: true,
      message: 'Código enviado para seu email. Verifique sua caixa de entrada.',
      email,
    };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    let errorMessage = 'Erro ao enviar código. Tente novamente.';
    
    if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Esta conta foi desabilitada.';
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Envia link de autenticação por email (wrapper para sendSignInLinkToEmail)
 */
export const sendEmailLink = async (email: string, actionCodeSettings: any): Promise<void> => {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
};

/**
 * Verifica se o link de email é válido e completa o login
 */
export const verifyOTP = async (email: string, emailLink?: string): Promise<VerifyOTPResult> => {
  try {
    // Se não foi passado emailLink, usar a URL atual
    const link = emailLink || window.location.href;
    
    console.log('Verificando link:', link);
    console.log('Email:', email);
    
    // Verificar se o link é válido
    if (!isSignInWithEmailLink(auth, link)) {
      console.error('Link não é um link de sign-in válido');
      return {
        success: false,
        user: null,
        error: 'Link inválido ou expirado. Solicite um novo link.',
      };
    }

    // Verificar se o email está salvo no localStorage (requisito do Firebase)
    const savedEmail = window.localStorage.getItem('emailForSignIn');
    const emailToUse = savedEmail || email;
    
    if (!emailToUse) {
      console.error('Email não encontrado no localStorage');
      return {
        success: false,
        user: null,
        error: 'Email não encontrado. Solicite um novo link.',
      };
    }

    console.log('Tentando fazer sign-in com email:', emailToUse);
    
    // Fazer sign-in com o link
    const userCredential = await signInWithEmailLink(auth, emailToUse, link);
    
    console.log('Sign-in bem-sucedido:', userCredential.user.uid);
    
    // Limpar email do localStorage após sucesso
    window.localStorage.removeItem('emailForSignIn');
    
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    console.error('Error verifying email link:', error);
    let errorMessage = 'Erro ao verificar link.';
    
    if (error.code === 'auth/invalid-action-code') {
      errorMessage = 'Link inválido ou expirado. Solicite um novo link.';
    } else if (error.code === 'auth/expired-action-code') {
      errorMessage = 'Link expirado. Solicite um novo link.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Esta conta foi desabilitada.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      user: null,
      error: errorMessage,
    };
  }
};

/**
 * Verifica o estado de autenticação do Firebase
 */
export const getCurrentFirebaseUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Faz logout do Firebase
 */
export const logoutFirebase = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out from Firebase:', error);
    throw error;
  }
};

/**
 * Obtém o token ID do Firebase para autenticação no backend
 */
export const getFirebaseIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting Firebase ID token:', error);
    return null;
  }
};

/**
 * Login com email e senha
 */
export const loginWithEmailPassword = async (email: string, password: string): Promise<{ user: FirebaseUser; error?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verificar se o email está verificado
    await user.reload(); // Recarregar dados do usuário para garantir que emailVerified está atualizado
    
    if (!user.emailVerified) {
      await firebaseSignOut(auth);
      return {
        user: user,
        error: 'EMAIL_NOT_VERIFIED'
      };
    }

    return { user };
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Criar conta com email e senha
 */
export const createAccount = async (email: string, password: string, name: string, phone: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Salvar dados adicionais no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
      emailVerified: false
    });

    // Enviar email de verificação
    await sendEmailVerification(user);

    return user;
  } catch (error: any) {
    console.error('Error creating account:', error);
    throw error;
  }
};

/**
 * Reenviar email de verificação
 */
export const resendVerificationEmail = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Nenhum usuário autenticado');
    }
    await sendEmailVerification(user);
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    throw error;
  }
};

/**
 * Buscar dados do usuário no Firestore
 */
export const getUserData = async (uid: string): Promise<any> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

