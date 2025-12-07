// src/components/WeeklySpendingChart.jsx
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { format, subDays, isSameDay } from "date-fns";

const WeeklySpendingChart = () => {
  const [data, setData] = useState([]);
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();

    const q = query(
      collection(db, "users", user.uid, "expenses")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const raw = snapshot.docs.map(doc => doc.data());
      const filtered = raw.filter(item =>
        item.date?.toDate && last7Days.some(day => isSameDay(item.date.toDate(), day))
      );

      const dailyTotals = last7Days.map(day => {
        const total = filtered
          .filter(exp => isSameDay(exp.date.toDate(), day))
          .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

        return {
          date: format(day, "dd MMM"),
          total: Number(total.toFixed(2)),
        };
      });

      setData(dailyTotals);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Spending</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#16a34a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklySpendingChart;
