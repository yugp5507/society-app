"use client";

import { Bell, Menu, User } from "lucide-react";

type TopNavbarProps = {
  title: string;
  onMenuClick: () => void;
};

export default function TopNavbar({ title, onMenuClick }: TopNavbarProps) {
  return (
    <header className="flex-shrink-0 flex h-16 w-full items-center justify-between bg-white px-4 shadow-sm border-b border-slate-200 md:px-8 z-20">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Page Title */}
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* User Avatar */}
        <button className="flex items-center gap-2 rounded-full hover:bg-slate-50 p-1 pr-2 transition-colors border border-transparent hover:border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            US
          </div>
          <span className="hidden md:block text-sm font-medium text-slate-700">
            Account
          </span>
        </button>
      </div>
    </header>
  );
}
