import React, { useState } from 'react';
import { db } from '@/firebase';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

const AddIncomeForm = ({ onAdd }) => {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;
    console.log('👤 User in handleSubmit:', user);

    if (!user || !source || !amount || !date) {
      console.warn('🚫 Missing fields or user not logged in');
      return;
    }

    setLoading(true);

    try {
      const incomeRef = collection(db, 'users', user.uid, 'incomeRecords');
      const newIncome = {
        source,
        amount: Number(amount),
        date: new Date(date),
        createdAt: new Date(),
      };
      await addDoc(incomeRef, newIncome);
      console.log('✅ Income added:', newIncome);

      if (onAdd) onAdd(newIncome);

      setSource('');
      setAmount('');
      setDate('');
    } catch (err) {
      console.error('🔥 Error adding income:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
      <h2 className="text-lg font-semibold text-green-700 mb-4">Add Income</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Income Source (e.g. Freelancing)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? 'Adding...' : 'Add Income'}
        </button>
      </form>
    </div>
  );
};

export default AddIncomeForm;
