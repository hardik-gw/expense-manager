import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, Wallet } from 'lucide-react';
import { getAccountNicknames, getUserCards } from '@/firestoreHelpers';
import { auth } from '@/firebase';

const StepPaymentMethod = ({ formData, onChange, onNext, onBack }) => {
  const [method, setMethod] = useState(formData.paymentMethod || '');
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(formData.paymentDetail || '');

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId || !method) return;

    const fetchData = async () => {
      if (method === 'UPI') {
        const data = await getAccountNicknames(userId);
        console.log("🔥 UPI accounts:", data);
        setAccounts(data || []);
      } else if (method === 'Credit Card') {
        const data = await getUserCards(userId);
        setCards(data || []);
      }
    };

    fetchData();
  }, [userId, method]);

  const handleNext = () => {
    if (!method) return alert("Pick a payment method, please!");

    const requiresDetail = method === 'UPI' || method === 'Credit Card';

    if (requiresDetail && !selectedDetail) {
      return alert(`Please select a ${method === 'UPI' ? 'bank account' : 'credit card'}`);
    }

    onChange("paymentMethod", method);
    onChange("paymentDetail", requiresDetail ? selectedDetail : "Cash");
    onNext();
  };

  const paymentOptions = [
    {
      label: 'Cash',
      icon: <Wallet className="w-5 h-5 mr-2" />,
    },
    {
      label: 'Credit Card',
      icon: <CreditCard className="w-5 h-5 mr-2" />,
    },
    {
      label: 'UPI',
      icon: <Banknote className="w-5 h-5 mr-2" />,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Step 3: Select Payment Method</h2>
      <img src="/src/assets/paymentmethod.png" alt="Payment Method" className="w-40 mx-auto" />

      <div className="flex gap-4 flex-wrap">
        {paymentOptions.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => {
              setMethod(label);
              setSelectedDetail(''); // reset selection when changing method
            }}
            className={`flex items-center gap-2 border px-4 py-2 rounded transition-all ${
              method === label ? 'bg-green-600 text-white border-green-600' : 'bg-white hover:border-green-400'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Dropdown for selected method */}
      {method === 'UPI' && accounts.length > 0 && (
        <div>
          <label className="block mt-4 text-sm font-medium">Select UPI Account</label>
          <select
            value={selectedDetail}
            onChange={(e) => setSelectedDetail(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          >
            <option value="">-- Choose UPI --</option>
            {accounts.map((acc, i) => (
              <option key={i} value={acc}>{acc}</option>
            ))}
          </select>
        </div>
      )}

      {method === 'Credit Card' && cards.length > 0 && (
        <div>
          <label className="block mt-4 text-sm font-medium">Select Credit Card</label>
          <select
            value={selectedDetail}
            onChange={(e) => setSelectedDetail(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          >
            <option value="">-- Choose Card --</option>
            {cards.map((card, i) => (
              <option key={i} value={card.cardNumber}>
                {card.cardNumber} – {card.cardHolder}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="border px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepPaymentMethod;
