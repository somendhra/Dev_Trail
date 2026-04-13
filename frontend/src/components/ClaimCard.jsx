import React from 'react'

export default function ClaimCard({title, amount, status, onClaim, isClaimed}){
  const displayStatus = isClaimed || status === 'CLAIMED' ? 'CLAIMED' : status === 'APPROVED' ? 'ACTIVE' : status;
  const statusColor = displayStatus === 'ACTIVE' ? 'text-green-600' :
                      displayStatus === 'CLAIMED' ? 'text-slate-400' :
                      displayStatus === 'PENDING' ? 'text-amber-500' : 'text-gray-500'

  return (
    <div className={`card p-4 bg-white border ${displayStatus === 'ACTIVE' ? 'border-green-200 shadow-sm' : 'border-slate-100'} rounded-xl mb-3 transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-slate-800">{title}</div>
          <div className="text-xs text-slate-400 mt-0.5">Insurance Coverage: <span className="font-bold text-indigo-600">₹{amount}</span></div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-xs font-black uppercase tracking-wider ${statusColor} bg-slate-50 px-2.5 py-1 rounded`}>
            {displayStatus}
          </div>
          {displayStatus === 'ACTIVE' && onClaim && (
            <button 
              onClick={onClaim}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
            >
              Claim Coverage
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
