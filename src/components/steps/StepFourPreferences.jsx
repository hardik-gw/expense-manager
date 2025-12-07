import preferences from '../../assets/preferences.png';
import { useState } from 'react';

const StepFourPreferences = () => {
  const [budgetStyle, setBudgetStyle] = useState('simple');
  const [goal, setGoal] = useState('');

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 px-6 py-8">
      <img
        src={preferences}
        alt="Preferences"
        className="w-40 sm:w-48"
      />
      <div className="text-center sm:text-left w-full">
        <h2 className="text-3xl font-caveat text-brand mb-2">Your vibe, your money ✨</h2>
        <p className="text-gray-600 mb-4 text-base">
          Choose how you like to budget and what you're aiming for.
        </p>

        {/* Budgeting Style */}
        <div className="flex justify-center sm:justify-start gap-3 mb-4">
          {['simple', 'detailed'].map(type => (
            <button
              key={type}
              className={`px-4 py-2 rounded-xl border font-medium transition-all ${
                budgetStyle === type
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setBudgetStyle(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Goal Input */}
        <input
          type="text"
          className="border border-gray-300 rounded-xl px-4 py-2 w-full sm:w-2/3 focus:ring-2 focus:ring-brand"
          placeholder="What’s your #1 money goal?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>
    </div>
  );
};

export default StepFourPreferences;
