import React from 'react'

export default function NotificationCard({ title, desc, time, read }) {
  return (
    <div className={`p-4 rounded-xl border transition mb-2 ${
      read 
        ? 'bg-gray-800/20 border-gray-800/40 opacity-60' 
        : 'bg-gray-800/50 border-gray-700/50 shadow-sm border-l-4 border-l-sky-400'
    }`}>
      <div className={`text-sm tracking-wide ${read ? 'font-medium text-gray-500' : 'font-bold text-gray-100'}`}>{title}</div>
      <div className={`text-xs mt-1.5 leading-relaxed ${read ? 'text-gray-600' : 'text-gray-300 font-medium'}`}>{desc}</div>
      <div className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${read ? 'text-gray-600' : 'text-sky-400/80'}`}>{time}</div>
    </div>
  )
}
