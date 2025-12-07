const StepEnterNote = ({ formData, onChange, onNext, onBack }) => {
  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-green-800">Add a Note 📝</h2>
      <textarea
        className="border rounded-lg p-4"
        placeholder="e.g. Zomato dinner with friends"
        value={formData.note || ""}
        onChange={(e) => onChange("note", e.target.value)}
        rows={4}
      />
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">Back</button>
        <button onClick={onNext} className="btn-primary">Next</button>
      </div>
    </div>
  );
};
export default StepEnterNote;
