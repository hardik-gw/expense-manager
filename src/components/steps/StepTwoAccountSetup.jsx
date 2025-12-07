import piggybank from '../../assets/piggybank.png';

const StepTwoAccountSetup = ({
  accountCount,
  setAccountCount,
  onContinue,
  showContinue = true,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 px-6 py-8">
      <img src={piggybank} alt="Bank accounts" className="w-40 sm:w-48" />

      <div className="text-center sm:text-left">
        <h2 className="text-3xl font-caveat text-brand mb-2">Bank time 🏦</h2>
        <p className="text-gray-600 mb-4 text-base">
          How many accounts do you want to connect?
        </p>

        <div className="flex justify-center sm:justify-start gap-4 mb-4">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              className={`px-4 py-2 rounded-xl border font-semibold transition-all ${
                accountCount === num
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setAccountCount(num)}
            >
              {num}
            </button>
          ))}
        </div>

        {/* 🧭 Continue Button to launch nickname/color step */}
        {showContinue && (
          <button
            onClick={() => onContinue?.()}
            className="mt-2 bg-brand text-white px-5 py-2 rounded-lg shadow hover:bg-brand-dark transition"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};

export default StepTwoAccountSetup;
