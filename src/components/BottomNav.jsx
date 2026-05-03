import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Library, User, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function BottomNav() {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/genres', icon: Compass, label: 'Descubre' },
    { to: '/library', icon: Library, label: 'Biblioteca' },
    { to: '/profile', icon: User, label: 'Mía' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/study', icon: PenTool, label: 'Estudio' });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 flex justify-around pb-safe z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(236,72,153,0.1)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center py-3 px-4 text-xs font-medium transition-colors duration-200",
              isActive ? "text-pink-500" : "text-slate-400 hover:text-pink-400"
            )
          }
        >
          <item.icon className="w-6 h-6 mb-1" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
