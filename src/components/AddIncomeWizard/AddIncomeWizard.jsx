import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const getCurrentMonthId = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const AddIncomeWizard = ({ onComplete }) => {
  const [incomeAmount, setIncomeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !incomeAmount) return;

    setLoading(true);
    const monthId = getCurrentMonthId();
    const incomeEntriesRef = collection(db, 'users', user.uid, 'monthlyIncome', monthId, 'entries');

    try {
      await addDoc(incomeEntriesRef, {
        amount: parseFloat(incomeAmount),
        createdAt: new Date()
      });

      onComplete();
    } catch (err) {
      console.error("Failed to save income:", err);
      alert("Something went wrong. Try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 max-w-md">
      <h2 className="text-lg font-bold text-gray-800">Add Monthly Income 💰</h2>
      <input
        type="number"
        className="w-full border px-3 py-2 rounded"
        placeholder="Enter income amount"
        value={incomeAmount}
        onChange={(e) => setIncomeAmount(e.target.value)}
        required
        min={0}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Income'}
      </button>
    </form>
  );
};

export default AddIncomeWizard;
