// src/components/Transactions.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txns);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="font-semibold text-lg text-gray-800 mb-4">Recent Transactions</h2>
      <ul className="space-y-2 text-sm text-gray-600">
        {transactions.length === 0 ? (
          <p className="text-gray-400 italic">No recent transactions</p>
        ) : (
          transactions.map((txn) => (
            <li key={txn.id} className="flex justify-between border-b pb-1">
              <span>{txn.category || 'Unknown'}</span>
              <span className="text-red-500">-₹{parseFloat(txn.amount || 0).toFixed(2)}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Transactions;
