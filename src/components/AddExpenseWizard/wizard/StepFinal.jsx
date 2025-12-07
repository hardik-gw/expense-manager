import React from "react";
import { CheckCircle } from "lucide-react";
import { getAuth } from "firebase/auth";
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const StepFinal = ({ formData, onBack }) => {
  const {
    amount,
    category,
    paymentMethod,
    paymentDetail,
    note,
    date,
  } = formData;

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to submit expenses.");
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!category || !paymentMethod) {
      alert("Missing category or payment method.");
      return;
    }

    const finalDate = date ? new Date(date) : new Date();
    const finalPaymentDetail = paymentMethod === "Cash" ? "Cash" : (paymentDetail || "Unknown");

    try {
      await addDoc(collection(db, "users", user.uid, "expenses"), {
        userId: user.uid,
        amount: parseFloat(amount),
        category,
        paymentMethod,
        paymentDetail: finalPaymentDetail,
        note: note || "",
        date: finalDate,
        createdAt: serverTimestamp(),
      });

      alert("Expense added to Firebase! 💸");
    } catch (error) {
      console.error("🔥 Firestore Error:", {
        message: error.message,
        formData,
        payload: {
          userId: user.uid,
          amount: parseFloat(amount),
          category,
          paymentMethod,
          paymentDetail: finalPaymentDetail,
          note: note || "",
          date: finalDate,
          createdAt: serverTimestamp(),
        },
      });
      alert("Failed to add expense. Please try again.");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <img
        src="/src/assets/laststep.png"
        alt="Final Review"
        className="w-[250px] md:w-[300px] mx-auto"
      />

      <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
      <h2 className="text-2xl font-semibold text-green-700">Final Review</h2>

      <div className="space-y-2 text-left max-w-md mx-auto bg-gray-50 p-4 rounded-lg shadow">
        <p><strong>Amount:</strong> ₹{amount}</p>
        <p><strong>Category:</strong> {category}</p>
        <p><strong>Payment Method:</strong> {paymentMethod}</p>
        {paymentMethod !== "Cash" && (
          <p><strong>{paymentMethod === "UPI" ? "UPI Account" : "Card"}:</strong> {paymentDetail}</p>
        )}
        {note && <p><strong>Note:</strong> {note}</p>}
        <p>
          <strong>Date:</strong>{" "}
          {new Date(date || new Date()).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default StepFinal;
