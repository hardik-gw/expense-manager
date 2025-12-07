// components/CreditCard.jsx
import React from 'react';

const CreditCard = ({
  cardholder = 'Unnamed Card',
  balance = '0.00',
  type = 'primary',
}) => {
  const cardStyles = {
    primary: {
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      text: 'text-white',
      logo: '🟢',
    },
    secondary: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-white',
      logo: '🔵',
    },
    gold: {
      bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
      text: 'text-black',
      logo: '💛',
    },
  };

  const { bg, text, logo } = cardStyles[type] || cardStyles.primary;
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(parseFloat(balance) || 0);

  return (
    <div
      className={`relative min-w-[300px] h-[180px] rounded-2xl p-5 flex flex-col justify-between ${bg} ${text} shadow-lg hover:shadow-xl transition-shadow`}
    >
      {/* Top Row */}
      <div className="flex justify-between">
        <div>
          <p className="text-xs opacity-80">CARD</p>
          <p className="text-base font-semibold">{cardholder}</p>
        </div>
        <span className="text-2xl">{logo}</span>
      </div>

      {/* Balance */}
      <div className="mt-auto">
        <p className="text-xs opacity-80">BALANCE</p>
        <p className="text-xl font-bold">{formattedBalance}</p>
      </div>
    </div>
  );
};

export default CreditCard;
