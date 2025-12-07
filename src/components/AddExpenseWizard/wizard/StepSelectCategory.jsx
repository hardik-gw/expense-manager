import React from "react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  HelpCircle,
} from "lucide-react";
import { Tooltip } from "@mui/material";

const categories = [
  { id: "food", label: "Food", icon: Utensils },
  { id: "transport", label: "Transport", icon: Car },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "entertainment", label: "Entertainment", icon: Film },
  { id: "other", label: "Other / Unanimous", icon: HelpCircle },
];

const StepSelectCategory = ({ formData, onChange, onNext, onBack }) => {
  const selectedCategory = formData.category;

  const handleSelect = (id) => {
    onChange("category", id);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
      <img
        src="/src/assets/selectcategory.png"
        alt="Select Category"
        className="w-[300px] md:w-[350px]"
      />

      <div className="flex-1">
        <h2 className="text-2xl font-semibold text-green-800 mb-4">Pick a Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {categories.map(({ id, label, icon: Icon }) => (
            <Tooltip title={label} key={id} arrow>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(id)}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(id)}
                aria-label={`Select ${label} category`}
                className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center transition-all
                  ${
                    selectedCategory === id
                      ? "border-green-600 bg-green-50 ring-2 ring-green-500 scale-[1.05]"
                      : "border-gray-200 hover:border-green-400 hover:scale-[1.02]"
                  }`}
              >
                <Icon className="w-6 h-6 text-green-700" />
              </div>
            </Tooltip>
          ))}
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!selectedCategory}
            className={`px-6 py-2 rounded-lg text-white transition ${
              selectedCategory
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepSelectCategory;
