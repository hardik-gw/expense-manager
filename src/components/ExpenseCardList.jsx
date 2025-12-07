import React from 'react';
import { ShoppingCart, Utensils, Bus, Film, HeartPulse, MoreHorizontal } from 'lucide-react';

const categoryIcons = {
  groceries: <ShoppingCart className="text-green-600" />,
  food: <Utensils className="text-orange-500" />,
  transport: <Bus className="text-blue-600" />,
  entertainment: <Film className="text-purple-500" />,
  health: <HeartPulse className="text-red-500" />,
  other: <MoreHorizontal className="text-gray-500" />,
};

const ExpenseCardList = ({ expenses }) => {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {expenses.map((expense) => {
        const Icon = categoryIcons[expense.category?.toLowerCase()] || categoryIcons.other;
        return (
          <div
            key={expense.id}
            className="bg-white shadow-md rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition"
          >
            <div className="bg-gray-100 p-3 rounded-full">{Icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{expense.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{expense.category}</p>
            </div>
            <div className="text-right text-red-600 font-bold">
              - ₹{Number(expense.amount).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseCardList;
