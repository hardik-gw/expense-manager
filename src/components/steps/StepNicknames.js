import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // adjust this path if needed

const StepNicknames = ({ nextStep, prevStep, accountCount, nicknames, setNicknames }) => {
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize nickname fields based on accountCount
    const defaultNicknames = Array(accountCount).fill('');
    setNicknames(defaultNicknames);
  }, [accountCount, setNicknames]);

  const handleChange = (index, value) => {
    const updated = [...nicknames];
    updated[index] = value;
    setNicknames(updated);
  };

  const handleContinue = async () => {
    if (nicknames.some(n => n.trim() === '')) {
      setError('Please fill out all nickname fields 🙏');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('User not authenticated. Please log in again.');
        return;
      }

      const uid = user.uid;
      const userRef = doc(db, 'accounts', uid);

      await setDoc(userRef, {
        nicknames,
      });

      nextStep();
    } catch (err) {
      console.error('Error saving nicknames:', err);
      setError('Something went wrong saving your nicknames. Try again!');
    }
  };

  return (
    <div className="px-6 py-8 text-center">
      <h2 className="text-3xl font-caveat text-brand mb-4">Give your accounts some flavor 😎</h2>
      <p className="text-gray-600 mb-6">Add a nickname for each bank account so you can recognize them easily.</p>

      <div className="space-y-4 max-w-sm mx-auto">
        {nicknames.map((name, idx) => (
          <input
            key={idx}
            type="text"
            value={name}
            onChange={(e) => handleChange(idx, e.target.value)}
            placeholder={`Nickname for account ${idx + 1}`}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
          />
        ))}
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
        >
          Save & Continue →
        </button>
      </div>
    </div>
  );
};

export default StepNicknames;
