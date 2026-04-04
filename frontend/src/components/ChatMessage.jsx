import React from 'react'

export default function ChatMessage({from, text, time, theme, replyTo, messageId, onReply}){
  const isAgent = from === 'agent'
  const messageTime = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div style={{ 
      display: "flex", 
      width: "100%", 
      justifyContent: isAgent ? "flex-start" : "flex-end", 
      marginBottom: 12, 
      padding: "0 4px" 
    }}> 
      <div 
        style={{
          maxWidth: "80%",
          padding: "10px 14px",
          borderRadius: 18,
          borderBottomRightRadius: isAgent ? 18 : 2,
          borderBottomLeftRadius: isAgent ? 2 : 18,
          background: isAgent ? '#fff' : (theme?.gradient || "linear-gradient(135deg,#16a34a,#4ade80)"),
          color: isAgent ? "#334155" : "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          border: isAgent ? "1px solid #f1f5f9" : "none",
          position: "relative",
          animation: "slideUp 0.3s ease-out"
        }}
      > 
        {replyTo && (
          <div style={{
            background: "rgba(0,0,0,0.05)",
            borderLeft: "4px solid rgba(0,0,0,0.2)",
            padding: "6px 10px",
            marginBottom: "8px",
            borderRadius: "4px",
            fontSize: 12,
            fontStyle: "italic",
            color: isAgent ? "#475569" : "#f1f5f9"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "2px" }}>Replying to</div>
            <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
              {replyTo}
            </div>
          </div>
        )}
        <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.5, wordBreak: "break-word" }}>{text}</div>
        <div style={{ 
          fontSize: 9, 
          marginTop: 4, 
          fontWeight: 800, 
          textTransform: "uppercase", 
          letterSpacing: "0.2px",
          opacity: isAgent ? 0.4 : 0.8,
          textAlign: "right"
        }}>
          {messageTime}
        </div>
      </div>
    </div>
  )
}
