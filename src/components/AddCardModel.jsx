// components/AddCardModal.jsx
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';

const AddCardModal = ({ onClose }) => {
  const [cardHolder, setCardHolder] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState('primary'); // Optional style
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = getAuth().currentUser;
    if (!user) {
      alert("You must be signed in to add a card.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'cards'), {
        cardHolder: cardHolder || 'Unnamed Card',
        balance: parseFloat(balance) || 0,
        type,
        createdAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error('Error adding card:', error.message);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-green-800">Add New Card</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Card Nickname / Holder"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Starting Balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg focus:ring-green-500"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg focus:ring-green-500"
          >
            <option value="primary">Green</option>
            <option value="secondary">Blue</option>
            <option value="gold">Gold</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? 'Adding...' : 'Add Card'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;
