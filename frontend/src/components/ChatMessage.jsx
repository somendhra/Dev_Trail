import React from 'react'

export default function ChatMessage({ from, text, time, theme, replyTo }) {
  const isAgent = from === 'agent';
  const messageTime = time
    ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div style={{
      display: "flex",
      width: "100%",
      justifyContent: isAgent ? "flex-start" : "flex-end",
      marginBottom: 12,
      padding: "0 4px",
      alignItems: "flex-end",
      gap: 8,
    }}>
      {/* Agent avatar */}
      {isAgent && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#00D4AA,#7C3AED)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: "#fff",
          boxShadow: "0 0 12px rgba(0,212,170,0.3)",
          marginBottom: 2,
        }}>
          GS
        </div>
      )}

      <div
        style={{
          maxWidth: "78%",
          padding: "10px 14px",
          borderRadius: 18,
          borderBottomRightRadius: isAgent ? 18 : 4,
          borderBottomLeftRadius:  isAgent ? 4  : 18,
          background: isAgent
            ? "rgba(255,255,255,0.07)"
            : (theme?.gradient || "linear-gradient(135deg,#00D4AA,#7C3AED)"),
          color: "#F1F5F9",
          boxShadow: isAgent
            ? "0 2px 8px rgba(0,0,0,0.3)"
            : "0 4px 16px rgba(0,212,170,0.2)",
          border: isAgent
            ? "1px solid rgba(255,255,255,0.1)"
            : "none",
          position: "relative",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Reply quote */}
        {replyTo && (
          <div style={{
            background: "rgba(0,0,0,0.2)",
            borderLeft: `3px solid ${isAgent ? "#00D4AA" : "rgba(255,255,255,0.5)"}`,
            padding: "5px 10px",
            marginBottom: 8,
            borderRadius: "4px 8px 8px 4px",
            fontSize: 11,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.6)",
          }}>
            <div style={{ fontWeight: 700, marginBottom: 2, color: "rgba(255,255,255,0.8)" }}>Replying to</div>
            <div style={{
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {replyTo}
            </div>
          </div>
        )}

        {/* Message text */}
        <div style={{
          fontSize: 13.5, fontWeight: 500,
          lineHeight: 1.55, wordBreak: "break-word",
          color: "#F1F5F9",
          fontFamily: "'Inter', sans-serif",
        }}>
          {text}
        </div>

        {/* Timestamp */}
        <div style={{
          fontSize: 9, marginTop: 5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          color: isAgent ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.6)",
          textAlign: "right",
        }}>
          {messageTime}
        </div>
      </div>
    </div>
  );
}
