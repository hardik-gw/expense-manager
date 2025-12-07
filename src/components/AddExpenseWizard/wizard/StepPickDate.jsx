import { useEffect, useState } from "react";

const StepPickDate = ({ formData, onChange, onNext, onBack }) => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(formData.date || today);

  // Update if OCR changes the date
  useEffect(() => {
    if (formData.date && formData.date !== selectedDate) {
      setSelectedDate(formData.date);
    }
  }, [formData.date]);

  const handleNext = () => {
    onChange("date", selectedDate);
    onNext();
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-green-800">Pick a Date 📅</h2>
      <input
        type="date"
        className="border rounded-lg p-3"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        max={today}
      />
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">Back</button>
        <button onClick={handleNext} className="btn-primary">Next</button>
      </div>
    </div>
  );
};
export default StepPickDate;
