import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  orderBy,
  where
} from 'firebase/firestore';
import AddExpenseWizard from "../components/AddExpenseWizard/AddExpenseWizard";
import AddIncomeWizard from "../components/AddIncomeWizard/AddIncomeWizard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const calculateMonthsLeft = (targetDateStr) => {
  if (!targetDateStr) return 1;
  const today = new Date();
  const targetDate = new Date(targetDateStr);
  const diffInMonths = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24 * 30));
  return Math.max(1, diffInMonths);
};

const getCurrentMonthId = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const ExpenseManager = () => {
  const [goal, setGoal] = useState(0);
  const [targetDate, setTargetDate] = useState('');
  const [savingPerMonth, setSavingPerMonth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [showIncomeWizard, setShowIncomeWizard] = useState(false);
  const [foodDailySpend, setFoodDailySpend] = useState([]);
  const [shoppingDailySpend, setShoppingDailySpend] = useState([]);
  const [travelDailySpend, setTravelDailySpend] = useState([]);
  const [entertainmentDailySpend, setEntertainmentDailySpend] = useState([]);
  const [othersDailySpend, setOthersDailySpend] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  const getDailySpendForCategory = async (userId, category, year, month) => {
    const expensesRef = collection(db, 'users', userId, 'expenses');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, new Date(year, month, 0).getDate(), 23, 59, 59, 999);

    const q = query(
      expensesRef,
      where('category', '==', category),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date')
    );

    const snapshot = await getDocs(q);
    const daysInMonth = endDate.getDate();
    const dailySpendArr = Array(daysInMonth).fill(0);

    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.date.toDate();
      const day = date.getDate();
      dailySpendArr[day - 1] += data.amount;
    });

    return dailySpendArr.map((amount, idx) => ({
      day: (idx + 1).toString(),
      amount,
    }));
  };

  const fetchBudgetAndSpend = async (category, setStateFn) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthId = getCurrentMonthId();
    const daysInMonth = new Date(year, month, 0).getDate();

    const budgetRef = collection(db, 'users', user.uid, 'budgetSplits');
    const q = query(budgetRef, where('__name__', '==', monthId));
    const snapshot = await getDocs(q);

    let categoryBudget = 0;

    const categoryAliases = {
      transport: 'Travel',
      travel: 'Travel',
      other: 'Others',
      others: 'Others',
      entertainment: 'Entertainment',
      food: 'Food',
      shopping: 'Shopping',
    };

    const resolvedCategory = categoryAliases[category.toLowerCase()] || category;

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();

      const normalizedData = Object.entries(data).reduce((acc, [key, value]) => {
        acc[key.toLowerCase()] = value;
        return acc;
      }, {});

      const lowerResolved = resolvedCategory.toLowerCase();
      categoryBudget = typeof normalizedData[lowerResolved] === 'number'
        ? normalizedData[lowerResolved]
        : 0;
    }

    const dailyBudget = categoryBudget / daysInMonth;

    const spendData = await getDailySpendForCategory(
      user.uid,
      category.toLowerCase(),
      year,
      month
    );

    const enhanced = spendData.map(d => ({
      ...d,
      dailyBudget
    }));

    setStateFn(enhanced);
  };

  useEffect(() => {
    if (!user) return;

    const goalQuery = query(collection(db, 'users', user.uid, 'savingsGoals'));
    const unsubscribeGoals = onSnapshot(goalQuery, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (goals.length > 0) {
        let totalTarget = 0;
        let totalMonthlySavings = 0;
        goals.forEach(goal => {
          const target = goal.target || 0;
          const deadline = goal.deadline || '';
          const months = calculateMonthsLeft(deadline);
          totalTarget += target;
          totalMonthlySavings += Math.ceil(target / months);
        });
        setGoal(totalTarget);
        setSavingPerMonth(totalMonthlySavings);
        const closestGoal = goals.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
        setTargetDate(closestGoal.deadline);
      }
    });

    const fetchMonthlyIncome = async () => {
      const monthId = getCurrentMonthId();
      const entriesRef = collection(db, 'users', user.uid, 'monthlyIncome', monthId, 'entries');
      const snapshot = await getDocs(entriesRef);
      let total = 0;
      snapshot.forEach(doc => {
        total += doc.data().amount || 0;
      });
      setMonthlyIncome(total);
    };
    fetchMonthlyIncome();

    const expensesRef = collection(db, 'users', user.uid, 'expenses');
    const unsubscribeExpenses = onSnapshot(expensesRef, (snapshot) => {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const expenseDate = data.createdAt?.toDate?.();
        if (
          expenseDate &&
          expenseDate.getMonth() === thisMonth &&
          expenseDate.getFullYear() === thisYear
        ) {
          total += Number(data.amount || 0);
        }
      });
      setMonthlySpend(total);
    });

    fetchBudgetAndSpend('food', setFoodDailySpend);
    fetchBudgetAndSpend('shopping', setShoppingDailySpend);
    fetchBudgetAndSpend('transport', setTravelDailySpend);
    fetchBudgetAndSpend('entertainment', setEntertainmentDailySpend);
    fetchBudgetAndSpend('other', setOthersDailySpend);

    return () => {
      unsubscribeGoals();
      unsubscribeExpenses();
    };
  }, [user]);

  const renderGraph = (title, data, color) => (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke={color} strokeWidth={2} name="Spend" />
          <Line
            type="monotone"
            dataKey="dailyBudget"
            stroke="#FF0000"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            name="Daily Budget"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Expense Manager 💸</h1>

          <div className="mb-4 flex gap-4">
            <button
              onClick={() => setShowWizard(!showWizard)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {showWizard ? 'Cancel' : '➕ Add Expense'}
            </button>
            <button
              onClick={() => setShowIncomeWizard(!showIncomeWizard)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {showIncomeWizard ? 'Cancel' : '➕ Add Income'}
            </button>
          </div>

          {showWizard && (
            <div className="mb-6">
              <AddExpenseWizard onComplete={() => setShowWizard(false)} />
            </div>
          )}

          {showIncomeWizard && (
            <div className="mb-6">
              <AddIncomeWizard
                onComplete={async () => {
                  const monthId = getCurrentMonthId();
                  const entriesRef = collection(db, 'users', user.uid, 'monthlyIncome', monthId, 'entries');
                  const snapshot = await getDocs(entriesRef);
                  let total = 0;
                  snapshot.forEach(doc => {
                    total += doc.data().amount || 0;
                  });
                  setMonthlyIncome(total);
                  setShowIncomeWizard(false);
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Income This Month</h3>
              <p className="text-lg font-bold text-green-600">₹{monthlyIncome}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Total Spent This Month</h3>
              <p className="text-lg font-bold text-red-600">₹{monthlySpend}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Savings Target / Month</h3>
              <p className="text-lg font-bold text-indigo-600">₹{savingPerMonth || 0}</p>
              {goal > 0 && targetDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Goal: ₹{goal} by {targetDate}
                </p>
              )}
            </div>
          </div>

          {renderGraph("🍽 Food Spending This Month", foodDailySpend, "#00B050")}
          {renderGraph("🛍 Shopping Spending This Month", shoppingDailySpend, "#007bff")}
          {renderGraph("🚗 Transport Spending This Month", travelDailySpend, "#ff9900")}
          {renderGraph("🎮 Entertainment Spending This Month", entertainmentDailySpend, "#8e44ad")}
          {renderGraph("📦 Other Spending This Month", othersDailySpend, "#6c757d")}
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;
