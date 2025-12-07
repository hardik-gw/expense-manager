import wavingillustration from '../../assets/wavingillustration.png';

const StepOneWelcome = () => {
  return (
    <div className="text-center px-6 py-8">
      <img
        src={wavingillustration}
        alt="Welcome"
        className="w-40 mx-auto mb-6 drop-shadow-lg"
      />
      <h2 className="text-4xl font-caveat text-brand mb-3">Hey there 👋</h2>
      <p className="text-lg text-gray-600">
        Welcome to your personal finance tracker. Let’s set you up for success!
      </p>
    </div>
  );
};

export default StepOneWelcome;