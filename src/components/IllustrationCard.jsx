// IllustrationCard.jsx
import React from "react";

const IllustrationCard = () => {
  return (
    <div className="w-full rounded-2xl shadow-md bg-green-50 p-6 flex items-center justify-between overflow-hidden relative">
      {/* Text content */}
      <div>
        <h2 className="text-xl font-semibold text-green-900 mb-2">
          Stay On Top of Your Savings
        </h2>
        <p className="text-sm text-green-800">
          Monitor your spending and saving habits easily with real-time insights.
        </p>
      </div>

      {/* Image */}
      <div className="w-32 h-32 shrink-0 ml-4">
        <img
          src="/Savings-Guy.png"
          alt="Savings Illustration"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
};

export default IllustrationCard;

