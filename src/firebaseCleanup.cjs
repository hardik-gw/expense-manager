// firebaseCleanup.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // 🔑 your downloaded key file

// Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const deleteAccountNicknames = async () => {
  try {
    const usersSnapshot = await db.collection('users').get();

    for (const docSnap of usersSnapshot.docs) {
      const userRef = docSnap.ref;

      await userRef.update({
        accountNicknames: admin.firestore.FieldValue.delete()
      });

      console.log(`✅ Cleared nicknames for user: ${userRef.id}`);
    }

    console.log('🎉 All nicknames wiped successfully!');
  } catch (err) {
    console.error('❌ Failed to clean nicknames:', err);
  }
};

// Run it
deleteAccountNicknames();
