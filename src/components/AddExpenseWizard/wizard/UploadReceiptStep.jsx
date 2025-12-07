import React, { useState } from "react";
import axios from "axios";

const UploadReceiptStep = ({ onExtractedData = () => {}, onNext }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. OCR to get raw text
      const ocrRes = await axios.post("http://localhost:8080/ocr", formData);
      const text = ocrRes.data.text;

      // 2. AI parse that text to extract structured info
      const parseRes = await axios.post("http://localhost:8080/parse-text", { text });

      // 3. Pass everything to next step
      onExtractedData({
        text,
        ...parseRes.data,
      });

      onNext();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong during upload. Try again?");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onExtractedData({});
    onNext();
  };

  return (
    <div className="p-4 space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Upload a receipt (optional)
      </label>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
      <div className="flex space-x-4">
        <button
          disabled={!file || loading}
          onClick={handleUpload}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-indigo-300"
        >
          {loading ? "Analyzing..." : "Upload & Extract"}
        </button>
        <button
          onClick={handleSkip}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default UploadReceiptStep;
