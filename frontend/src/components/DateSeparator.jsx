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
      margin: "20px 0",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        width: "100%",
        height: "1px",
        background: "rgba(255,255,255,0.07)",
        zIndex: 0,
      }} />
      <div style={{
        background: "rgba(0,212,170,0.08)",
        padding: "4px 16px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        color: "#00D4AA",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        zIndex: 1,
        border: "1px solid rgba(0,212,170,0.2)",
        fontFamily: "'Inter', sans-serif",
      }}>
        {getLabel(date)}
      </div>
    </div>
  );
}
