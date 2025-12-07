// src/components/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Wallet,
  BarChart2,
  LogOut,
  ReceiptText,
  PiggyBank, // ✅ New icon for savings
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";

const Sidebar = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-2 py-2 rounded-md transition ${
      isActive ? "text-green-700 font-semibold bg-green-50" : "text-gray-600 hover:text-green-700"
    }`;

  return (
    <aside className="h-screen w-64 bg-white shadow-md p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold text-green-700 mb-8">My Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <NavLink to="/dashboard" className={navLinkClasses}>
            <Home size={20} /> Home
          </NavLink>
          <NavLink to="/expenses" className={navLinkClasses}>
            <ReceiptText size={20} /> Expense Manager
          </NavLink>
          <NavLink to="#" className={navLinkClasses}>
            <Wallet size={20} /> Wallet
          </NavLink>
          <NavLink to="#" className={navLinkClasses}>
            <BarChart2 size={20} /> Analytics
          </NavLink>
          <NavLink to="/savings" className={navLinkClasses}>
            <PiggyBank size={20} /> Savings
          </NavLink>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 text-red-500 hover:text-red-600"
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
