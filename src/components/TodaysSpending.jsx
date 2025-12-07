import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { getAuth } from 'firebase/auth';
import { startOfDay, addDays } from 'date-fns';

const TodaysSpending = () => {
  const [total, setTotal] = useState(0);
  const [topCategory, setTopCategory] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    const todayStart = Timestamp.fromDate(startOfDay(new Date()));
    const tomorrowStart = Timestamp.fromDate(addDays(startOfDay(new Date()), 1));

    const q = query(
      collection(db, 'users', user.uid, 'expenses'),
      where('date', '>=', todayStart),
      where('date', '<', tomorrowStart)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("🔥 Snapshot fired", snapshot.docs.length);

      const data = snapshot.docs.map((doc) => doc.data());

      const totalAmount = data.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0
      );

      const categoryMap = {};
      data.forEach((item) => {
        const cat = item.category;
        categoryMap[cat] = (categoryMap[cat] || 0) + parseFloat(item.amount || 0);
      });

      const topCat = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

      setTotal(totalAmount);
      setTopCategory(topCat ? topCat[0] : null);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-800">Today’s Spending</h3>
      <p className="text-2xl font-bold text-green-600 mt-2">₹{total.toFixed(2)}</p>
      {topCategory && (
        <p className="text-sm text-gray-600 mt-1">
          Mostly on{' '}
          <span className="font-medium text-gray-800">{topCategory}</span> 🤑
        </p>
      )}
    </div>
  );
};

export default TodaysSpending;
