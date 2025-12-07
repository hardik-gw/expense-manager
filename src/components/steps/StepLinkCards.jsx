import React, { useEffect, useState, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import CreditCard from '../../components/CreditCard';
import AddCardModal from '../../components/AddCardModel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const StepLinkCards = ({ nextStep }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const scrollRef = useRef(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    setDoc(userDocRef, { createdAt: new Date() }, { merge: true });

    const q = query(collection(db, 'cards'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCards(fetchedCards);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-green-800 text-center">Link Your Cards</h2>

      <div className="relative">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md p-2 rounded-full hover:bg-green-100 transition"
          onClick={scrollLeft}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md p-2 rounded-full hover:bg-green-100 transition"
          onClick={scrollRight}
        >
          <ChevronRight size={20} />
        </button>

        <div className="overflow-x-auto no-scrollbar px-8" ref={scrollRef}>
          <div className="flex gap-6 w-max pb-2">
            {loading ? (
              <p>Loading cards...</p>
            ) : cards.length === 0 ? (
              <p>No cards yet. Add one!</p>
            ) : (
              cards.map((card) => (
                <CreditCard
                  key={card.id}
                  cardholder={card.cardHolder}
                  number={card.cardNumber}
                  expiry={card.expiry}
                  balance={card.balance}
                  type={card.type}
                />
              ))
            )}

            <div
              onClick={() => setShowAddCard(true)}
              className="min-w-[300px] h-[180px] rounded-2xl border-2 border-dashed border-green-500 flex items-center justify-center cursor-pointer hover:bg-green-50 transition"
            >
              <div className="text-green-600 text-center space-y-1">
                <div className="text-4xl font-bold">+</div>
                <p className="text-sm font-medium">Add New Card</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={nextStep}
          className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
        >
          Continue
        </button>
      </div>

      {showAddCard && user && (
        <AddCardModal onClose={() => setShowAddCard(false)} userId={user.uid} />
      )}
    </div>
  );
};

export default StepLinkCards;