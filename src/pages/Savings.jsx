import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import BudgetSplitForm from '../components/BudgetSplitForm';

const Savings = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [estimatedSpend, setEstimatedSpend] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [customMonths, setCustomMonths] = useState(0);
  const [simIncome, setSimIncome] = useState('');
  const [simSpend, setSimSpend] = useState('');
  const [customBudget, setCustomBudget] = useState({
    Food: 35,
    Shopping: 25,
    Transport: 20,
    Entertainment: 10,
    Other: 10,
  });

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);

      const goalsRef = collection(db, 'users', u.uid, 'savingsGoals');
      const snapshot = await getDocs(goalsRef);
      const goalsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGoals(goalsData);

      const profileRef = doc(db, 'users', u.uid, 'financialProfile', 'incomeAndSpend');
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setMonthlyIncome(data.income);
        setEstimatedSpend(data.spend);
        setSimIncome(data.income);
        setSimSpend(data.spend);
      }
    });

    return () => unsubscribe();
  }, []);

  const calculateMonths = () => {
    if (!goalDeadline) return 1;
    const deadline = new Date(goalDeadline);
    const now = new Date();
    return Math.max(1, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24 * 30)));
  };

  const handleAddGoal = async () => {
    if (!newGoal || !targetAmount || !goalDeadline || !user) return;

    try {
      const goalsRef = collection(db, 'users', user.uid, 'savingsGoals');
      const newDoc = await addDoc(goalsRef, {
        title: newGoal,
        target: Number(targetAmount),
        saved: 0,
        createdAt: new Date(),
        deadline: goalDeadline,
      });

      const profileRef = doc(db, 'users', user.uid, 'financialProfile', 'incomeAndSpend');
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          income: Number(monthlyIncome),
          spend: Number(estimatedSpend),
          updatedAt: new Date(),
        });
      }

      setGoals((prev) => [
        ...prev,
        {
          id: newDoc.id,
          title: newGoal,
          target: Number(targetAmount),
          saved: 0,
          deadline: goalDeadline,
        },
      ]);

      setNewGoal('');
      setTargetAmount('');
      setGoalDeadline('');
      setCustomMonths(0);
    } catch (err) {
      console.error('🔥 Error adding goal or saving income/spend:', err.message);
      alert('Something went wrong while saving your goal. Please try again.');
    }
  };

  const handleBudgetChange = (category, value) => {
    const updated = { ...customBudget, [category]: Number(value) };
    const total = Object.values(updated).reduce((sum, val) => sum + val, 0);
    if (total <= 100) setCustomBudget(updated);
    else alert("Total split can't exceed 100%");
  };

  const spendingCategories = Object.entries(customBudget).map(([label, percent]) => ({
    label,
    percent: percent / 100,
  }));

  const getSpendingTips = (spending, gap) => {
    return spendingCategories.map((cat) => {
      const catSpend = Math.round(spending * cat.percent);
      const cut = Math.round(Math.min(catSpend * 0.15, gap / spendingCategories.length));
      let suggestion = '';
      switch (cat.label) {
        case 'Food':
          suggestion = `Skip 2-3 takeouts: Cut ₹${cut} from Food`;
          break;
        case 'Shopping':
          suggestion = `Delay a purchase: Cut ₹${cut} from Shopping`;
          break;
        case 'Transport':
          suggestion = `Skip Ubers 2x/mo: Cut ₹${cut} from Transport`;
          break;
        case 'Entertainment':
          suggestion = `1 less movie/outing: Cut ₹${cut} from Entertainment`;
          break;
        default:
          suggestion = `Trim ₹${cut} from Other`;
      }
      return { ...cat, suggestion };
    });
  };

  const getAffordabilityMeter = (income, spend, monthsOverride) => {
    const months = monthsOverride || customMonths || calculateMonths();
    const goal = Number(targetAmount);
    const requiredMonthlySave = Math.ceil(goal / months);
    const estimatedMonthlySavings = income - spend;

    if (estimatedMonthlySavings >= requiredMonthlySave) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-green-700 font-semibold">✅ On track!</span>
          <span className="text-sm text-gray-700">
            You can save ₹{requiredMonthlySave}/mo, with ₹{estimatedMonthlySavings - requiredMonthlySave} to spare.
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-red-700 font-semibold">🚫 Not enough</span>
          <span className="text-sm text-gray-700">
            You need ₹{requiredMonthlySave}/mo but can only spare ₹{estimatedMonthlySavings}.
            Increase savings by ₹{requiredMonthlySave - estimatedMonthlySavings}.
          </span>
        </div>
      );
    }
  };

  const renderSpendingTips = (spend, gap) => {
    if (gap <= 0) return null;
    const tips = getSpendingTips(spend, gap);
    return (
      <div className="mt-2">
        <div className="font-semibold text-gray-700 mb-1">Spending Breakdown Tips:</div>
        <ul className="list-disc ml-6 text-sm">
          {tips.map((tip, idx) => (
            <li key={idx}>{tip.suggestion}</li>
          ))}
        </ul>
      </div>
    );
  };

  const actualIncome = simIncome !== '' ? Number(simIncome) : Number(monthlyIncome);
  const actualSpend = simSpend !== '' ? Number(simSpend) : Number(estimatedSpend);
  const months = customMonths || calculateMonths();
  const goal = Number(targetAmount);
  const requiredMonthlySave = months ? Math.ceil(goal / months) : 0;
  const estimatedMonthlySavings = actualIncome - actualSpend;
  const gap = requiredMonthlySave - estimatedMonthlySavings;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-green-700">Savings Goals 💰</h1>

          <div className="bg-white p-4 rounded-lg shadow space-y-3 max-w-md">
            <input
              type="text"
              placeholder="New Goal Title"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="number"
              placeholder="Target Amount (₹)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="date"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <label className="text-sm text-gray-600">Custom Timeline (months): {customMonths}</label>
            <input
              type="range"
              min="1"
              max="24"
              value={customMonths}
              onChange={(e) => setCustomMonths(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              placeholder="Simulated Monthly Income (₹)"
              value={simIncome}
              onChange={(e) => setSimIncome(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="number"
              placeholder="Simulated Monthly Spend (₹)"
              value={simSpend}
              onChange={(e) => setSimSpend(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={handleAddGoal}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Save Goal ✅
            </button>

            {targetAmount && actualSpend && actualIncome && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mt-4 space-y-2">
                <h4 className="text-md font-semibold text-yellow-700">🧮 Affordability Gap Meter</h4>
                {getAffordabilityMeter(actualIncome, actualSpend, months)}
                {gap > 0 && renderSpendingTips(actualSpend, gap)}
              </div>
            )}

            <div className="pt-4">
              <BudgetSplitForm budget={customBudget} onChange={handleBudgetChange} />
            </div>
          </div>

          {goals.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow space-y-3 max-w-md mt-6">
              <h2 className="text-lg font-bold text-green-700">Your Saved Goals</h2>
              {goals.map((goal) => (
                <div key={goal.id} className="border-b pb-2 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{goal.title}</span>
                    <span className="text-xs text-gray-500">
                      Target: ₹{goal.target} | Deadline: {goal.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Savings;
