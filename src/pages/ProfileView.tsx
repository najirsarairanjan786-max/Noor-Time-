import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, LogOut, Camera, UserCircle, Phone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, updateProfile, updateEmail, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function ProfileView({ setView, onSkip }: { setView: (view: string) => void, onSkip?: () => void }) {
  const { user, logOut } = useAuth();
  const auth = getAuth();
  
  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  // Profile state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (user) {
      setPhotoURL(user.photoURL || '');
      setEmail(user.email || '');
      
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFirstName(data.firstName || '');
            setMiddleName(data.middleName || '');
            setLastName(data.lastName || '');
          } else if (user.displayName) {
            const parts = user.displayName.split(' ');
            if (parts.length > 0) setFirstName(parts[0]);
            if (parts.length > 2) {
              setMiddleName(parts[1]);
              setLastName(parts.slice(2).join(' '));
            } else if (parts.length > 1) {
              setLastName(parts.slice(1).join(' '));
            }
          }
        } catch (e) {
          console.error("Error fetching profile", e);
        }
      };
      
      fetchProfile();
    }
  }, [user]);

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
      
      try {
        if ((window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
        }
      } catch (e) {}
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
      setConfirmationResult(null);
      setPhone('');
      setOtp('');
    } catch (err: any) {
      setError('Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const newDisplayName = [firstName, middleName, lastName].filter(Boolean).join(' ');
      
      await updateProfile(user, {
        displayName: newDisplayName,
        photoURL
      });
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        firstName,
        middleName,
        lastName,
        displayName: newDisplayName,
        updatedAt: new Date()
      }, { merge: true });
      
      if (email && email !== user.email) {
        await updateEmail(user, email);
        await sendEmailVerification(user);
        setSuccess('Profile updated! Verification email sent.');
      } else {
        setSuccess('Profile updated successfully!');
      }
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError('Changing email requires a recent login. Please re-authenticate.');
      } else {
        setError(err.message);
      }
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
        className="min-h-screen bg-[#050B14] pb-24 overflow-y-auto"
      >
        <div className="bg-emerald-900/40 p-4 pt-12 rounded-b-3xl shadow-lg relative px-6">
          <button 
            onClick={() => setView('home')}
            className="absolute top-12 left-4 p-2 rounded-full hover:bg-white/10 transition-colors text-emerald-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center mt-8">
            <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
            <p className="text-emerald-200/70 text-sm">Manage your account</p>
          </div>
        </div>

        <div className="p-6 max-w-lg mx-auto">
          <div className="flex flex-col items-center mb-8 relative">
            <div className="w-24 h-24 rounded-full bg-emerald-900/50 flex items-center justify-center text-4xl overflow-hidden border-2 border-emerald-500 shadow-xl relative group">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-12 h-12 text-emerald-400" />
              )}
              <div className="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover:flex transition-all cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            {firstName && <h2 className="text-xl font-bold text-white mt-4">{[firstName, lastName].filter(Boolean).join(' ')}</h2>}
            <p className="text-emerald-200/50 text-sm mt-1">{user.phoneNumber || user.email}</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">Photo URL</label>
              <input 
                type="url" 
                value={photoURL} 
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                  placeholder="First name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">Middle Name (Optional)</label>
                <input 
                  type="text" 
                  value={middleName} 
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Middle name"
                />
              </div>
            </div>

            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">Last Name</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="Last name"
              />
            </div>
            
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold mb-1 ml-1">Email <span className="text-emerald-500/50 text-[10px]">(Optional - Verification will be sent)</span></label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-emerald-800/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                placeholder="your.email@example.com"
              />
              {user.email && !user.emailVerified && (
                <div className="text-[10px] text-amber-400 mt-1 ml-1 font-medium">
                  Verification pending for {user.email}
                </div>
              )}
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
            onClick={() => { logOut(); }}
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[100dvh] bg-[#050B14] flex flex-col justify-center px-4 relative"
    >
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-emerald-200/70 text-sm">Welcome back to your account</p>
        </div>

        <div id="recaptcha-container"></div>
        {error && <div className="bg-rose-900/40 text-rose-300 p-3 rounded-xl text-sm mb-6 border border-rose-800/50">{error}</div>}
        
        <div className="bg-emerald-900/20 rounded-3xl p-8 border border-emerald-800/30 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
          
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-900 to-emerald-800 flex items-center justify-center shadow-lg border border-emerald-700/50 relative">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-pulse"></div>
              <Phone className="w-8 h-8 text-emerald-400 relative z-10" />
            </div>
          </div>

          {!confirmationResult ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
              <div>
                <label className="block text-emerald-200/70 text-xs font-semibold mb-2 ml-1 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-emerald-800/50 rounded-2xl px-5 py-4 text-white text-base outline-none focus:border-emerald-500 transition-colors tracking-wider font-mono shadow-inner"
                    placeholder="+91 1234567890"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div>
                <label className="block text-emerald-200/70 text-xs font-semibold mb-2 ml-1 uppercase tracking-wider">OTP Code</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-black/40 border border-emerald-800/50 rounded-2xl px-5 py-4 text-white text-2xl text-center outline-none focus:border-emerald-500 transition-colors tracking-[0.5em] font-mono shadow-inner"
                  placeholder="123456"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setConfirmationResult(null);
                  setOtp('');
                }}
                className="text-emerald-400/80 text-sm font-medium mt-4 hover:text-emerald-300 transition-colors"
              >
                Wrong Number? Change it
              </button>
            </form>
          )}

          <p className="text-[10px] text-center text-emerald-600/60 mt-8 font-medium">
            Secure authentication powered by Firebase
          </p>
        </div>
        
        {onSkip && (
          <div className="mt-6 text-center">
            <button 
              onClick={onSkip}
              className="text-emerald-400/70 hover:text-emerald-300 font-medium text-sm transition-colors decoration-emerald-500/30 underline-offset-4 hover:underline"
            >
              Skip and continue without logging in
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
