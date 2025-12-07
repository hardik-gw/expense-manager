import React, { useState } from "react";
import StepEnterAmount from "./wizard/StepEnterAmount";
import StepSelectCategory from "./wizard/StepSelectCategory";
import StepPaymentMethod from "./wizard/StepPaymentMethod";
import StepEnterNote from "./wizard/StepEnterNote";
import StepPickDate from "./wizard/StepPickDate";
import UploadReceiptStep from "./wizard/UploadReceiptStep";
import StepFinal from "./wizard/StepFinal";

const AddExpenseWizard = () => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    paymentMethod: "",
    paymentDetail: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    receiptUrl: "",
  });

  const [currentStep, setCurrentStep] = useState(0);

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // 👇 the magical OCR prefill handler
  const handleExtractedData = (data) => {
  console.log("📄 Extracted data from OCR:", data);
  alert(`📦 OCR Extracted:\n${JSON.stringify(data, null, 2)}`);

  setFormData((prev) => ({
    ...prev,
    ...data,
  }));
};


  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = () => {
    console.log("✅ Final submitted data:", formData);
    alert("Submitted successfully!");
    // TODO: Firestore logic here
  };

  const steps = [
    <UploadReceiptStep onExtractedData={handleExtractedData} onNext={nextStep} />,
    <StepEnterAmount formData={formData} onChange={handleChange} onNext={nextStep} onBack={prevStep} />,
    <StepSelectCategory formData={formData} onChange={handleChange} onNext={nextStep} onBack={prevStep} />,
    <StepPaymentMethod formData={formData} onChange={handleChange} onNext={nextStep} onBack={prevStep} />,
    <StepEnterNote formData={formData} onChange={handleChange} onNext={nextStep} onBack={prevStep} />,
    <StepPickDate formData={formData} onChange={handleChange} onNext={nextStep} onBack={prevStep} />,
    <StepFinal formData={formData} onBack={prevStep} onSubmit={handleSubmit} />,
  ];

  const stepLabels = ["Receipt", "Amount", "Category", "Payment", "Note", "Date", "Done"];

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow-md">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-6">
        {stepLabels.map((label, index) => (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                ${index === currentStep ? "bg-green-600 text-white" :
                  index < currentStep ? "bg-green-400 text-white" :
                    "bg-gray-200 text-gray-600"}`}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-2 text-center text-gray-700">{label}</span>
            {index !== stepLabels.length - 1 && (
              <div
                className={`absolute top-4 left-[calc(100%+2px)] h-1 w-full z-[-1] 
                  ${index < currentStep ? "bg-green-500" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {steps[currentStep]}
    </div>
  );
};

export default AddExpenseWizard;
