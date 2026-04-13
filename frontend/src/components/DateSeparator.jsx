import React from 'react';

export default function DateSeparator({ date }) {
  // Helper to get descriptive date
  const getLabel = (dateStr) => {
    const today = new Date();
    const d = new Date(dateStr);
    
    const isToday = d.getDate() === today.getDate() &&
                    d.getMonth() === today.getMonth() &&
                    d.getFullYear() === today.getFullYear();
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = d.getDate() === yesterday.getDate() &&
                        d.getMonth() === yesterday.getMonth() &&
                        d.getFullYear() === yesterday.getFullYear();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      margin: "24px 0",
      position: "relative"
    }}>
      <div style={{ 
        position: "absolute", 
        width: "100%", 
        height: "1px", 
        background: "#e2e8f0", 
        zIndex: 0 
      }} />
      <div style={{ 
        background: "#f1f5f9", 
        padding: "4px 16px", 
        borderRadius: "20px", 
        fontSize: "11px", 
        fontWeight: "700", 
        color: "#64748b", 
        textTransform: "uppercase", 
        letterSpacing: "0.5px",
        zIndex: 1,
        border: "1px solid #e2e8f0"
      }}>
        {getLabel(date)}
      </div>
    </div>
  );
}
