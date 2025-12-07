import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';

const categories = ['Food', 'Shopping', 'Travel', 'Entertainment', 'Others'];

export default function BudgetSplitForm() {
  const { currentUser: user } = useAuth();

  const [income, setIncome] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [splits, setSplits] = useState({});
  const [loading, setLoading] = useState(true);

  const monthId = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const incomeDoc = await getDoc(
          doc(db, 'users', user.uid, 'monthlyIncome', monthId, 'entries', 'vyF8ti66icO8klseb1jp')
        );

        // 🧠 Grab latest savings goal
        const q = query(
          collection(db, 'users', user.uid, 'savingsGoals'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        const savingsDoc = snapshot.docs[0];

        const incomeVal = incomeDoc.exists() ? Number(incomeDoc.data().amount) || 0 : 0;
        const savingsVal = savingsDoc ? Number(savingsDoc.data().target) || 0 : 0;

        setIncome(incomeVal);
        setSavingsGoal(savingsVal);

        const splitRef = doc(db, 'users', user.uid, 'budgetSplits', monthId);
        const splitSnap = await getDoc(splitRef);
        if (splitSnap.exists()) {
          setSplits(splitSnap.data());
        } else {
          setSplits({
            Food: 0,
            Shopping: 0,
            Travel: 0,
            Entertainment: 0,
            Others: 0,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('⚠️ Error loading budget data:', err);
        alert('Error loading budget data: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [user, monthId]);

  const available = Math.max(0, Number(income) - Number(savingsGoal));
  const lastCategory = categories[categories.length - 1];

  const sumExceptLast = categories
    .slice(0, -1)
    .reduce((acc, cat) => acc + (Number(splits[cat]) || 0), 0);

  const lastValue = Math.max(available - sumExceptLast, 0);
  const displaySplits = { ...splits, [lastCategory]: lastValue };

  const onChangeSplit = (category, value) => {
    if (category === lastCategory) return;

    const newVal = Math.max(0, Number(value));

    setSplits((prev) => ({
      ...prev,
      [category]: newVal,
    }));
  };

  const total = Object.values(displaySplits).reduce((a, b) => a + (Number(b) || 0), 0);
  const isValid = total === available;

  const saveBudget = async () => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid, 'budgetSplits', monthId);
    await setDoc(ref, {
      ...displaySplits,
      total,
      createdAt: new Date(),
    });
    alert('✅ Budget saved!');
  };

  if (!user || loading) return <p>Loading your budget setup...</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold text-brand">💰 Monthly Budget Split</h2>
      <p className="text-sm text-gray-600">Income: ₹{income}</p>
      <p className="text-sm text-gray-600">Savings Goal: ₹{savingsGoal}</p>
      <p className="text-sm font-semibold">To Split: ₹{available}</p>

      {categories.map((cat) => (
        <div key={cat} className="flex justify-between items-center">
          <label className="w-32">{cat}:</label>
          <input
            type="number"
            min={0}
            value={displaySplits[cat]}
            className={`border p-1 w-32 rounded ${
              cat === lastCategory ? 'bg-gray-200 cursor-not-allowed' : ''
            }`}
            onChange={(e) => onChangeSplit(cat, e.target.value)}
            readOnly={cat === lastCategory}
          />
        </div>
      ))}

      <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-500'}`}>
        Total: ₹{total} / ₹{available}
      </p>

      <button
        disabled={!isValid}
        onClick={saveBudget}
        className="bg-brand text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        Save Budget Split
      </button>
    </div>
  );
}
