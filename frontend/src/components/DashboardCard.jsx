import React from 'react'

export default function DashboardCard({ title, value, small, icon, accent = "#6366f1" }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform"
          style={{ 
            background: `${accent}15`, 
            color: accent 
          }}
        >
          {icon || "💰"}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Overview</span>
      </div>
      
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</div>
      <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
      {small && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{small}</span>
        </div>
      )}
    </div>
  )
}
