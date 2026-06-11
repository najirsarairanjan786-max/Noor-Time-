import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, Facebook, LogOut, Camera, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, FacebookAuthProvider, signInWithPopup, browserPopupRedirectResolver } from 'firebase/auth';

export function ProfileView({ setView }: { setView: (view: string) => void }) {
  const { user, logOut, signIn } = useAuth();
  const auth = getAuth();
  const [method, setMethod] = useState<'selection' | 'email' | 'phone'>('selection');
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      // Default to +91 (India) if no + is provided, since the user is communicating in Hindi
      formattedPhone = '+91' + formattedPhone;
    }
    
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      if (err.message.includes('auth/invalid-phone-number')) {
        setError('Invalid phone number. Ensure it has a country code (e.g. +91).');
      } else if (err.message.includes('auth/unauthorized-domain')) {
        setError('Domain not authorized. Please add *.run.app in your Firebase Console under Authentication settings.');
      } else if (err.message.includes('popup')) {
        setError('Popup blocked by browser or iframe. Open app in a new tab.');
      } else {
        setError(err.message);
      }
      // Reset recaptcha on error so user can try again
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(otp);
    } catch (err: any) {
      if (err.message.includes('auth/invalid-verification-code')) {
        setError('Invalid OTP code. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    } catch (err: any) {
      if (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('popup')) {
        setError('Login restricted in preview. Please open the app in a new tab.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL
        });
        setSuccess('Profile updated successfully!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="min-h-screen bg-[#050B14] pb-24"
      >
        <div className="bg-emerald-900/40 p-4 pt-12 rounded-b-3xl shadow-lg relative px-6">
          <button 
            onClick={() => setView('home')}
            className="absolute top-12 left-4 p-2 rounded-full hover:bg-white/10 transition-colors text-emerald-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center mt-8">
            <h1 className="text-2xl font-bold text-white mb-2">My Profile</h1>
          </div>
        </div>

        <div className="p-6 max-w-lg mx-auto">
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 bg-emerald-900/20 p-6 rounded-3xl border border-emerald-800/30">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/30" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-800/50 flex items-center justify-center border-4 border-emerald-500/30">
                    <UserCircle className="w-12 h-12 text-emerald-300/50" />
                  </div>
                )}
              </div>
              
              <div className="w-full">
                <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">Profile Image URL</label>
                <input 
                  type="text" 
                  value={photoURL} 
                  onChange={(e) => setPhotoURL(e.target.value)}
                  className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">Display Name</label>
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="Enter your name"
              />
            </div>
            
            {error && <div className="text-rose-400 text-xs text-center">{error}</div>}
            {success && <div className="text-emerald-400 text-xs text-center">{success}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-900/20 mt-2"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>

          <button 
            onClick={() => { logOut(); setMethod('selection'); }}
            className="w-full mt-6 py-3 flex items-center justify-center gap-2 bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 font-semibold rounded-xl transition-colors border border-rose-900/50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-[#050B14] pb-24 overflow-y-auto"
    >
      <div className="bg-emerald-900/40 p-4 pt-12 rounded-b-3xl shadow-lg relative px-6">
        <button 
          onClick={() => method === 'selection' ? setView('home') : setMethod('selection')}
          className="absolute top-12 left-4 p-2 rounded-full hover:bg-white/10 transition-colors text-emerald-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center mt-8">
          <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-emerald-200/70 text-sm">To access your account</p>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto">
        <div id="recaptcha-container"></div>
        {error && <div className="bg-rose-900/40 text-rose-300 p-3 rounded-xl text-sm mb-6 border border-rose-800/50">{error}</div>}
        
        {method === 'selection' && (
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => signIn()}
              className="w-full flex items-center gap-4 bg-white hover:bg-gray-100 text-[#050B14] p-4 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <button 
              onClick={handleFacebookLogin}
              className="w-full flex items-center gap-4 bg-[#1877F2] hover:bg-[#166FE5] text-white p-4 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <Facebook className="w-6 h-6" />
              Sign in with Facebook
            </button>

            <div className="flex items-center gap-4 py-3">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-white/40 font-medium">OR</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <button 
              onClick={() => setMethod('phone')}
              className="w-full flex items-center gap-4 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50 text-white p-4 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <Phone className="w-5 h-5 text-emerald-400" />
              Continue with Phone
            </button>

            <button 
              onClick={() => setMethod('email')}
              className="w-full flex items-center gap-4 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50 text-white p-4 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <Mail className="w-5 h-5 text-emerald-400" />
              Continue with Email
            </button>
            <div className="text-center mt-6 p-4 border border-rose-800 bg-rose-900/20 rounded-xl relative z-20">
              <p className="text-xs text-rose-200">
                <strong>Important Note:</strong> To make Email, Phone, and Facebook logins work, ensure you have enabled them in your Firebase console under Authentication &gt; Sign-in method, and added the preview domain (*.run.app) to your Authorized domains!
              </p>
            </div>
          </div>
        )}

        {method === 'email' && (
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="address@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] z-20 relative"
            >
              {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-emerald-400 text-sm font-medium mt-4 hover:text-emerald-300 z-20 relative"
            >
              {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register'}
            </button>
          </form>
        )}

        {method === 'phone' && !confirmationResult && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">Phone Number</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors tracking-widest font-mono"
                placeholder="+1234567890"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] z-20 relative"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {method === 'phone' && confirmationResult && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">OTP Code</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm text-center outline-none focus:border-emerald-500 transition-colors tracking-widest font-mono text-xl"
                placeholder="123456"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] z-20 relative"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
