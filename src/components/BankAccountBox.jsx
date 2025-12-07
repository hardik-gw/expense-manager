// components/BankAccountBox.jsx
import { Landmark } from 'lucide-react';
import clsx from 'clsx';

const colorStyles = {
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-700',
    hover: 'hover:bg-green-100',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-700',
    hover: 'hover:bg-blue-100',
  },
  gold: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    hover: 'hover:bg-yellow-100',
  },
};

const BankAccountBox = ({ nickname, balance, color = 'green', type }) => {
  const styles = colorStyles[color] || colorStyles.green;

  return (
    <div
      className={clsx(
        'w-[300px] h-[180px] rounded-2xl p-4 shadow-md transition cursor-pointer relative overflow-hidden flex flex-col justify-between',
        styles.bg,
        styles.hover
      )}
    >
      <Landmark size={40} className={clsx(styles.icon)} />
      <div className="text-lg font-bold">{nickname}</div>
      <div className="absolute bottom-3 right-4 bg-white/80 px-3 py-1 rounded-lg text-sm text-gray-800 shadow">
        ₹ {balance?.toLocaleString() || '0'}
      </div>
      <div className="absolute top-3 right-4 text-xs text-gray-500 uppercase">{type}</div>
    </div>
  );
};

export default BankAccountBox;
