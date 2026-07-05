/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface PatientAuthProps {
  onBack: () => void;
  darkMode: boolean;
}

export function PatientAuth({ onBack, darkMode }: PatientAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    patientEmail: '', // For linking to existing patient record
  });

  // Auto-dismiss message
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        // Patient Login
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

        // Check if user has patient portal access
        const patientUserDoc = await getDoc(doc(db, 'patientUsers', userCredential.user.uid));

        if (!patientUserDoc.exists()) {
          // Not a patient user, sign them out
          await auth.signOut();
          setMessage({
            type: 'error',
            text: 'This account is not registered as a patient. Please sign up first.'
          });
          setLoading(false);
          return;
        }

        // Update last login
        await setDoc(doc(db, 'patientUsers', userCredential.user.uid), {
          lastLogin: new Date().toISOString(),
        }, { merge: true });

        setMessage({ type: 'success', text: 'Login successful!' });
      } else {
        // Patient Signup
        if (!formData.displayName || !formData.patientEmail) {
          setMessage({ type: 'error', text: 'Please fill in all fields' });
          setLoading(false);
          return;
        }

        // Create auth account
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

        // Create patient user document
        await setDoc(doc(db, 'patientUsers', userCredential.user.uid), {
          id: userCredential.user.uid,
          email: formData.email,
          displayName: formData.displayName,
          patientEmail: formData.patientEmail, // Store to link with patient record
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });

        setMessage({ type: 'success', text: 'Account created successfully!' });
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials';
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-6",
      darkMode
        ? "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900"
        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    )}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className={cn(
          "fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200",
          darkMode
            ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
            : "bg-white hover:bg-slate-50 text-slate-900 shadow-lg"
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className={cn(
        "w-full max-w-md rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm",
        darkMode
          ? "bg-white/10 border border-white/20"
          : "bg-white border border-slate-200"
      )}>
        {/* Header */}
        <div className={cn(
          "p-8 text-center",
          darkMode ? "bg-gradient-to-br from-blue-600 to-purple-600" : "bg-gradient-to-br from-blue-600 to-blue-700"
        )}>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Patient Portal
          </h1>
          <p className="text-blue-100 text-sm">
            {isLogin ? "Access your health records" : "Create your patient account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Message Banner */}
          {message.text && (
            <div className={cn(
              "p-4 rounded-xl text-sm font-semibold",
              message.type === 'error'
                ? darkMode
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-red-50 text-red-700 border border-red-200"
                : darkMode
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-green-50 text-green-700 border border-green-200"
            )}>
              {message.text}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-slate-300" : "text-slate-700")}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 outline-none",
                  darkMode
                    ? "bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                )}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-slate-300" : "text-slate-700")}>
                Patient Email (used during registration)
              </label>
              <input
                type="email"
                value={formData.patientEmail}
                onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 outline-none",
                  darkMode
                    ? "bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                )}
                placeholder="Email used when you became a patient"
                required
              />
              <p className={cn("text-xs mt-2", darkMode ? "text-slate-400" : "text-slate-600")}>
                This should match the email in your patient records
              </p>
            </div>
          )}

          <div>
            <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-slate-300" : "text-slate-700")}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={cn(
                "w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-4 outline-none",
                darkMode
                  ? "bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              )}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className={cn("block text-sm font-bold mb-2", darkMode ? "text-slate-300" : "text-slate-700")}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all focus:ring-4 outline-none",
                  darkMode
                    ? "bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                )}
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors",
                  darkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-600"
                )}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2",
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
            )}
          >
            {loading ? (
              "Processing..."
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In to Portal
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage({ type: '', text: '' });
              }}
              className={cn(
                "text-sm font-semibold transition-colors",
                darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              )}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
