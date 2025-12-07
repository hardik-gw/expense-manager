import StepOneWelcome from './steps/StepOneWelcome';
import StepTwoAccountSetup from './steps/StepTwoAccountSetup';
import StepThreeAddCards from './steps/StepThreeAddCards';
import StepLinkCards from './steps/StepLinkCards';
import StepFourPreferences from './steps/StepFourPreferences';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StepAccountSetup from './steps/StepAccountSetup';

import { db, auth } from '../firebase'; // 👈 auth added here
import { doc, setDoc } from 'firebase/firestore'; // 👈 setDoc used now

const SignupStepper = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const [accountCount, setAccountCount] = useState(1);
  const [cardData, setCardData] = useState({
    hasLinkedCards: false,
    wantsToAdd: false,
  });

  const steps = [
    { title: 'Welcome', component: StepOneWelcome },
    {
      title: 'Accounts',
      component: (props) => (
        <StepTwoAccountSetup
          {...props}
          accountCount={accountCount}
          setAccountCount={setAccountCount}
        />
      ),
    },
    {
      title: 'Account Setup',
      component: (props) => (
        <StepAccountSetup
          {...props}
          accountCount={accountCount}
          setAccountCount={setAccountCount}
        />
      ),
    },
    {
      title: 'Cards',
      component: (props) => (
        <StepThreeAddCards
          {...props}
          cardData={cardData}
          setCardData={setCardData}
        />
      ),
    },
  ];

  if (cardData.hasLinkedCards && cardData.wantsToAdd) {
    steps.push({
      title: 'Link Cards',
      component: (props) => <StepLinkCards {...props} />,
    });
  }

  steps.push({ title: 'Preferences', component: StepFourPreferences });

  const CurrentComponent = steps[step].component;

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error('⚠️ No authenticated user found.');
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    await setDoc(userRef, {
      accountCount,
      cardData,
      onboardingComplete: true,
      createdAt: new Date(),
    });

    // ✅ Set localStorage *after* successful Firestore write
    localStorage.setItem('onboardingComplete', 'true');
    console.log('✅ User onboarding data saved!');
    
    navigate('/dashboard');
  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-10 shadow-xl relative">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all duration-500 ease-in-out"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-green-600 font-hand text-xl mt-2">
            Step {step + 1} of {steps.length} — {steps[step].title}
          </p>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <CurrentComponent
              nextStep={nextStep}
              prevStep={prevStep}
              accountCount={accountCount}
              setAccountCount={setAccountCount}
              cardData={cardData}
              setCardData={setCardData}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <button
              onClick={prevStep}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Finish 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupStepper;
