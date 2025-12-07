import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#4ade80', '#facc15', '#60a5fa', '#f87171', '#c084fc', '#f472b6', '#34d399', '#f97316'];

const MonthlyCategoryChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());

      const q = query(
        collection(db, 'users', user.uid, 'expenses'),
        where('date', '>=', start),
        where('date', '<=', end)
      );

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const expenses = snapshot.docs.map(doc => doc.data());

        const categoryMap = {};

        expenses.forEach((expense) => {
          const cat = expense.category || 'Other';
          const amt = parseFloat(expense.amount || 0);
          categoryMap[cat] = (categoryMap[cat] || 0) + amt;
        });

        const formattedData = Object.entries(categoryMap).map(([name, value]) => ({
          name,
          value
        }));

        setData(formattedData);
      });

      // 🔁 Clean up the snapshot listener when auth state changes
      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">This Month’s Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            dataKey="value"
            isAnimationActive={true}
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyCategoryChart;
