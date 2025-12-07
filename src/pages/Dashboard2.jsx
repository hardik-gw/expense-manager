import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

// UI Components
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Transactions from '../components/Transactions';
import IllustrationCard from '../components/IllustrationCard';
import CreditCard from '../components/CreditCard';
import AddCardModal from '../components/AddCardModel'; // Make sure filename matches: "Modal" not "Model"
import TodaysSpending from '../components/TodaysSpending';
import WeeklySpendingChart from '../components/WeeklySpendingChart';
import MonthlyCategoryChart from '../components/MonthlyCategoryChart';
import ExpenseCardList from '../components/ExpenseCardList';

import {
  ChevronLeft,
  ChevronRight,
  Landmark,
  PlusCircle,
} from 'lucide-react';

import { getUserBankAccounts } from '../firestoreHelpers';


const Dashboard = () => {
  const [userId, setUserId] = useState(null);
  const [cards, setCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);

  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUserId(currentUser.uid);
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const cardsRef = collection(db, 'users', userId, 'cards');
    const unsubscribeCards = onSnapshot(cardsRef, (snapshot) => {
      const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(fetchedCards);
      setLoadingCards(false);
    });

    const accountsRef = collection(db, 'users', userId, 'bankAccounts');
    const unsubscribeAccounts = onSnapshot(accountsRef, async (snapshot) => {
      if (!snapshot.empty) {
        const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBankAccounts(fetchedAccounts);
      } else {
        const fallbackAccounts = await getUserBankAccounts(userId);
        setBankAccounts(fallbackAccounts);
      }
      setLoadingAccounts(false);
    });

    const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', userId));
    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const fetchedExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(fetchedExpenses);
    });

    return () => {
      unsubscribeCards();
      unsubscribeAccounts();
      unsubscribeExpenses();
    };
  }, [userId]);

  const recentExpenses = [...expenses]
    .sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* ➕ Add Expense Button */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/expenses')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <PlusCircle size={18} /> Add Expense
            </button>
          </div>

          {/* 📊 Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TodaysSpending />
            <WeeklySpendingChart />
            <MonthlyCategoryChart />
          </div>

          {/* 💸 Recent Expenses */}
          {expenses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-green-800">Recent Expenses</h2>
              <ExpenseCardList expenses={recentExpenses} />
            </div>
          )}

          {/* 🏦 Bank Accounts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-800">Your Bank Accounts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loadingAccounts ? (
                <p>Loading accounts...</p>
              ) : bankAccounts.length === 0 ? (
                <p>No bank accounts found. 🚫</p>
              ) : (
                bankAccounts.map((acc) => {
                  const bgColor = acc.color === 'green' ? 'bg-green-50' : acc.color === 'blue' ? 'bg-blue-50' : 'bg-gray-100';
                  const iconColor = acc.color === 'green' ? 'text-green-700' : acc.color === 'blue' ? 'text-blue-700' : 'text-gray-600';
                  const balanceColor = acc.color === 'green' ? 'text-green-600' : acc.color === 'blue' ? 'text-blue-600' : 'text-gray-700';

                  return (
                    <div key={acc.id} className={`${bgColor} rounded-2xl shadow-md p-4 group hover:shadow-lg transition cursor-pointer`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-white shadow ${iconColor}`}>
                          <Landmark size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{acc.nickname}</h3>
                          <p className="text-sm text-gray-500 capitalize">{acc.type}</p>
                        </div>
                      </div>
                      <div className={`mt-4 text-xl font-bold transition-opacity opacity-0 group-hover:opacity-100 ${balanceColor}`}>
                        ₹ {Number(acc.balance).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 💳 Cards Section */}
          <div className="space-y-4 relative">
            <h2 className="text-xl font-semibold text-green-800">Your Cards</h2>
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md p-2 rounded-full hover:bg-green-100 transition" onClick={scrollLeft}>
                <ChevronLeft size={20} />
              </button>
              <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md p-2 rounded-full hover:bg-green-100 transition" onClick={scrollRight}>
                <ChevronRight size={20} />
              </button>

              <div className="overflow-x-auto no-scrollbar px-8" ref={scrollRef}>
                <div className="flex gap-6 w-max pb-2">
                  {loadingCards ? (
                    <p>Loading cards...</p>
                  ) : cards.length === 0 ? (
                    <p>No cards yet. Add one!</p>
                  ) : (
                    cards.map((card) => (
                      <CreditCard
                        key={card.id}
                        cardholder={card.cardHolder || 'Unnamed'}
                        balance={card.balance || '0.00'}
                        type={card.type || 'primary'}
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
          </div>

          {/* 📈 Placeholders & Extras */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center text-gray-500">
                Chart Coming Soon 📊
              </div>
            </div>
            <IllustrationCard image="/Savings-Guy.png" title="Stay On Top of Your Savings" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-xl p-4 h-32 flex items-center justify-center text-gray-400 font-semibold border border-dashed border-gray-300"
              >
                Coming Soon 🚧
              </div>
            ))}
          </div>

          {/* 🔄 Transactions */}
          <Transactions expenses={recentExpenses} />
        </main>
      </div>

      {/* 💳 Add Card Modal */}
      {showAddCard && userId && (
        <AddCardModal onClose={() => setShowAddCard(false)} />
      )}
    </div>
  );
};

export default Dashboard;
