import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

// ✅ UPDATED: Fetch UPI account nicknames from user's bankAccounts subcollection
export const getAccountNicknames = async (userId) => {
  try {
    const bankAccountsRef = collection(db, 'users', userId, 'bankAccounts');
    const querySnapshot = await getDocs(bankAccountsRef);
    const nicknames = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.nickname) {
        nicknames.push(data.nickname);
      }
    });
    return nicknames;
  } catch (error) {
    console.error('Error fetching account nicknames:', error);
    return [];
  }
};

// ✅ Fetch user's cards from subcollection 'cards'
export const getUserCards = async (userId) => {
  try {
    const cardsRef = collection(db, 'users', userId, 'cards');
    const querySnapshot = await getDocs(cardsRef);
    const cards = [];
    querySnapshot.forEach((doc) => {
      cards.push({ id: doc.id, ...doc.data() });
    });
    return cards;
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
};

// ✅ Fetch user's bank accounts from subcollection 'bankAccounts'
export const getUserBankAccounts = async (userId) => {
  try {
    const bankAccountsRef = collection(db, 'users', userId, 'bankAccounts');
    const querySnapshot = await getDocs(bankAccountsRef);
    const accounts = [];
    querySnapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() });
    });
    return accounts;
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return [];
  }
};
