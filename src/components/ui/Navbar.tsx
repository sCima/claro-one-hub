'use client';

import { motion } from 'framer-motion';
import { Bell, LogOut, User } from 'lucide-react';
import { useClaroData } from '../../hooks/useClaroData';

export function Navbar({ onLogout }: { onLogout: () => void }) {
  const { user } = useClaroData();

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-16 flex items-center px-6 justify-between"
    >
      <div className="flex items-center gap-2">
        <span className="text-[#D52B1E] font-bold text-2xl tracking-tight select-none">claro</span>
        <span className="text-xs text-[#ADAFAF] font-medium ml-2 hidden sm:block">One Hub</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-[#ADAFAF]" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D52B1E] rounded-full" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#D52B1E]/10 flex items-center justify-center">
            <User className="w-4 h-4 text-[#D52B1E]" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.name.split(' ')[0]}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5 text-[#ADAFAF]" strokeWidth={1.5} />
        </button>
      </div>
    </motion.header>
  );
}
