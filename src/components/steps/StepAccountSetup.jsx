import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';

const COLORS = ['green', 'blue', 'gold'];
const TYPES = ['primary', 'secondary', 'tertiary'];

const StepAccountSetup = ({ accountCount, nextStep }) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setAccounts(
      Array(accountCount)
        .fill()
        .map(() => ({
          nickname: '',
          balance: '',
          type: 'primary',
          color: 'green',
        }))
    );
  }, [accountCount]);

  const handleChange = (index, field, value) => {
    setAccounts((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const saveAccounts = async () => {
    if (!user) {
      console.error('🛑 No user found.');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    // ✅ Ensure user doc exists or gets updated
    await setDoc(userDocRef, { createdAt: new Date() }, { merge: true });

    // 💾 Save accounts under users/{uid}/bankAccounts
    const accountsCollectionRef = collection(userDocRef, 'bankAccounts');

    const promises = accounts.map((acc) =>
      addDoc(accountsCollectionRef, {
        nickname: acc.nickname.trim() || 'Unnamed Account',
        balance: Number(acc.balance) || 0,
        type: acc.type,
        color: acc.color,
        createdAt: serverTimestamp(),
      })
    );

    try {
      await Promise.all(promises);
      console.log('✅ Accounts saved successfully!');
      nextStep();
    } catch (err) {
      console.error('🔥 Failed to save accounts:', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-green-800">
        Set Up Your Accounts
      </h2>

      {accounts.map((acc, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3 bg-white shadow-sm">
          <h3 className="font-semibold text-lg text-gray-700">Account {i + 1}</h3>

          <input
            type="text"
            value={acc.nickname}
            onChange={(e) => handleChange(i, 'nickname', e.target.value)}
            placeholder="Nickname (e.g. Savings)"
            className="w-full border px-3 py-2 rounded-md"
          />

          <input
            type="number"
            value={acc.balance}
            onChange={(e) => handleChange(i, 'balance', e.target.value)}
            placeholder="Initial Balance"
            className="w-full border px-3 py-2 rounded-md"
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <select
              value={acc.type}
              onChange={(e) => handleChange(i, 'type', e.target.value)}
              className="border px-3 py-2 rounded-md"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={acc.color}
              onChange={(e) => handleChange(i, 'color', e.target.value)}
              className="border px-3 py-2 rounded-md"
            >
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button
        onClick={saveAccounts}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
      >
        Save Accounts & Continue
      </button>
    </div>
  );
};

export default StepAccountSetup;
