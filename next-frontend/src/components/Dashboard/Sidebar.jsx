"use client";
import React from 'react';
import { BookOpen, Users, Compass, BarChart2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { id: 'library', name: 'My Library', icon: <BookOpen size={20} />, path: '/dashboard' },
    { id: 'classes', name: 'Classes', icon: <Users size={20} />, path: '/classes' },
    { id: 'discover', name: 'Discover', icon: <Compass size={20} />, path: '/discovery' },
    { id: 'reports', name: 'Reports', icon: <BarChart2 size={20} />, path: '/reports' },
  ];

  return (
    <div className="w-64 bg-[#5D3FD3] border-r-[3px] border-zk-black flex flex-col h-[calc(100vh-76px)] fixed top-[76px] left-0 text-white z-40 rounded-r-xl">
      {/* Logo Area */}
      <div className="p-6 border-b-[3px] border-zk-black bg-[#5D3FD3] rounded-xl">
        <h1 className="font-black text-3xl text-white uppercase tracking-tighter">ZINKO</h1>
        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mt-1">Manage & Create</p>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4 flex flex-col gap-3 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <div 
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-4 p-3 font-bold text-sm cursor-pointer transition-all border-[2px] ${
                isActive 
                  ? 'bg-[#7C4DFF] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white' 
                  : 'border-transparent hover:bg-white/10 text-white/90'
              } rounded-lg`}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
