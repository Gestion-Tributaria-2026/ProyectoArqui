"use client";

import { UserButton } from "@clerk/nextjs";

interface SidebarProps {
  userName: string;
  userRole: "ADMIN" | "CLIENTE";
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

export default function Sidebar({ userName, userRole, activeTab, setActiveTab, tabs }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Isotipo y Título del Estudio (Maqueta 1 a 11) */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="h-7 w-7 bg-[#0f2d59] rounded flex items-center justify-center text-white font-bold text-sm">
            📁
          </div>
          <span className="font-bold text-lg text-[#0f2d59] tracking-tight">ESTUDIO CONTABLE</span>
        </div>
        
        {/* Navegación Dinámica según las pestañas que le mande cada Dashboard */}
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-slate-100 text-[#0f2d59] font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Footer del Sidebar con el Avatar de Clerk */}
      <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
        <UserButton />
        <div className="text-xs truncate">
          <p className="font-semibold text-slate-700 truncate">{userName}</p>
          <p className="text-slate-400 capitalize">{userRole.toLowerCase()}</p>
        </div>
      </div>
    </aside>
  );
}