import surfboardcard from '../../assets/surfboardcard.png';

const StepThreeAddCards = ({ cardData, setCardData }) => {
  const updateField = (field, value) => {
    setCardData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 px-6 py-8">
      <img
        src={surfboardcard}
        alt="Card setup"
        className="w-40 sm:w-48"
      />
      <div className="text-center sm:text-left space-y-4">
        <h2 className="text-3xl font-caveat text-brand mb-2">
          Let’s talk cards 💳
        </h2>
        <p className="text-gray-600 text-base">
          Just a couple quick questions to get your setup right.
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="accent-brand h-5 w-5"
              checked={cardData?.hasLinkedCards || false}
              onChange={(e) =>
                updateField('hasLinkedCards', e.target.checked)
              }
            />
            Do you have cards linked to your bank accounts?
          </label>

          {cardData?.hasLinkedCards && (
            <label className="flex items-center gap-3 ml-4">
              <input
                type="checkbox"
                className="accent-brand h-5 w-5"
                checked={cardData?.wantsToAdd || false}
                onChange={(e) =>
                  updateField('wantsToAdd', e.target.checked)
                }
              />
              Do you want to add them to Surfboard?
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepThreeAddCards;
