import React from "react";

const Topbar = () => {
  return (
    <header className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-xl font-bold text-green-800">Welcome Back 👋</h1>
      <div className="w-10 h-10 bg-green-100 rounded-full"></div>
    </header>
  );
};

export default Topbar;
