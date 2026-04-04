import React from 'react'

export default function NotificationCard({ title, desc, time, read }) {
  return (
    <div className={`p-4 rounded-xl border transition mb-2 ${
      read 
        ? 'bg-slate-50/50 border-slate-100 opacity-60' 
        : 'bg-white border-indigo-50 shadow-sm shadow-indigo-50 border-l-4 border-l-indigo-500'
    }`}>
      <div className={`text-sm ${read ? 'font-medium text-slate-500' : 'font-black text-slate-900'}`}>{title}</div>
      <div className={`text-xs mt-1 ${read ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>{desc}</div>
      <div className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{time}</div>
    </div>
  )
}
