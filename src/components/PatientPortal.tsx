/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PatientAuth } from './PatientAuth';
import { PatientDashboard } from './PatientDashboard';

interface PatientPortalProps {
  onBack: () => void;
  darkMode: boolean;
}

export function PatientPortal({ onBack, darkMode }: PatientPortalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPatientUser, setIsPatientUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if this user has patient portal access
        const patientUserDoc = await getDoc(doc(db, 'patientUsers', currentUser.uid));

        if (patientUserDoc.exists()) {
          setIsPatientUser(true);
          setUser(currentUser);
        } else {
          // Not a patient user, sign them out
          await signOut(auth);
          setIsPatientUser(false);
          setUser(null);
        }
      } else {
        setUser(null);
        setIsPatientUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsPatientUser(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-slate-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isPatientUser) {
    return <PatientAuth onBack={onBack} darkMode={darkMode} />;
  }

  return <PatientDashboard user={user} onSignOut={handleSignOut} darkMode={darkMode} />;
}
