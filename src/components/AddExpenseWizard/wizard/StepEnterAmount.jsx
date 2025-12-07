import React, { useState, useEffect } from "react";

const StepEnterAmount = ({ formData, onChange, onNext }) => {
  const [amount, setAmount] = useState(formData.amount || "");

  // Keep in sync with formData updates (from OCR etc)
  useEffect(() => {
    if (formData.amount && formData.amount !== amount) {
      setAmount(formData.amount);
    }
  }, [formData.amount]);

  const handleNext = () => {
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount");
      return;
    }
    onChange("amount", amount);
    onNext();
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
      <img
        src="/src/assets/enteramount.png"
        alt="Enter Amount"
        className="w-[250px] md:w-[300px]"
      />
      <div className="flex-1">
        <h2 className="text-2xl font-semibold text-green-800 mb-4">Enter Amount</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Enter amount"
        />
        <button
          onClick={handleNext}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepEnterAmount;
