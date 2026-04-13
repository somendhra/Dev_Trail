import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import DateSeparator from '../components/DateSeparator'
import api from '../api';
import { FaPaperPlane, FaHeadset, FaCommentAlt } from 'react-icons/fa';

const defaultTheme = { gradient: "linear-gradient(135deg,#16a34a,#4ade80)", light: "#f0fdf4", accent: "#16a34a" };

const STYLES = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .chat-card { animation: slideUp 0.5s ease both; }
  .chat-scroll { scroll-behavior: smooth; }
  .chat-scroll::-webkit-scrollbar { width: 6px; }
  .chat-scroll::-webkit-scrollbar-track { background: transparent; }
  .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
`;

export default function ChatSupport() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [theme, setTheme] = useState(defaultTheme);
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);

  // ── Build a clean chronological timeline from the DB records ──────────────
  // Two record types exist:
  //   isFromAdmin=false  ➜  user bubble  (question field)
  //   isFromAdmin=true   ➜  agent bubble (answer field)
  const loadMessages = async () => {
    try {
      const qs = await api.getMyQueries();
      const msgs = qs
        .map(q => (q.isFromAdmin || q.fromAdmin)
          ? { id: q.id, from: 'agent', text: q.answer,   time: q.createdAt, replyTo: q.replyToMessage }
          : { id: q.id, from: 'user',  text: q.question, time: q.createdAt }
        )
        .sort((a, b) => new Date(a.time) - new Date(b.time));
      setMessages(msgs);
      
      // If there are unread admin messages, mark them as read since the user is currently viewing the chat
      if (qs.some(q => (q.isFromAdmin || q.fromAdmin) && !q.readByUser)) {
        api.userMarkQueriesAsRead().then(() => {
          // Notify other components to clear their counts instantly
          window.dispatchEvent(new Event('chatRead'));
        }).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Initialise + start live polling ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const init = async () => {
      try {
        const u = await api.getCurrentUser();
        setUser(u);
        
        // Mark messages as read
        await api.userMarkQueriesAsRead();
        window.dispatchEvent(new Event('chatRead'));

        const partners = await api.getPartners();
        if (Array.isArray(partners)) {
          const p = partners.find(ptr => ptr.name === u.platform);
          if (p) {
            setTheme({
              gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`,
              light:    p.borderColor ? `${p.borderColor}22` : "#f0fdf4",
              accent:   p.borderColor || "#16a34a"
            });
          }
        }

        await loadMessages();
      } catch (e) {
        console.error(e);
      }
    };

    init();

    // Poll every 5 s so users see admin replies without refreshing
    const poll = setInterval(loadMessages, 5000);
    return () => clearInterval(poll);
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll to bottom whenever the message list updates ──────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Send a new message ───────────────────────────────────────────────────
  const send = async () => {
    if (!text.trim()) return;
    const tempText = text;
    setText('');
    try {
      await api.postQuery(tempText);
      await loadMessages();
    } catch (e) {
      console.error(e);
      setText(tempText); // revert on error
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = async () => {
    if (!window.confirm("Are you sure you want to clear your chat history? This cannot be undone.")) return;
    try {
      if (api.userClearChat) await api.userClearChat();
      setMessages([]);
    } catch (e) {
      console.error(e);
      alert("Failed to clear chat");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: theme.gradient,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
        }}>
          <FaHeadset size={22} />
        </div>
        <div>
          <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>Support Center</h2>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>We're here to help you</p>
        </div>
        <div style={{ flex: 1 }} />
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              padding: "8px 16px",
              background: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className="chat-card" style={{
        background: "#fff", borderRadius: 24, overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 500
      }}>

        {/* Messages body */}
        <div ref={scrollRef} className="chat-scroll" style={{
          flex: 1, overflowY: "auto", padding: "24px 20px",
          background: "#f8fafc",
          backgroundImage: "radial-gradient(#e2e8f0 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px"
        }}>
          {messages.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5, textAlign: "center", padding: 40 }}>
              <FaCommentAlt size={48} style={{ color: theme.accent, marginBottom: 16 }} />
              <p style={{ fontWeight: 600, color: "#475569" }}>No messages yet</p>
              <p style={{ fontSize: 13, color: "#64748b" }}>Ask a question below to start a conversation with our support team.</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const currentDate = m.time ? new Date(m.time).toDateString() : null;
              const prevDate = i > 0 && messages[i-1].time ? new Date(messages[i-1].time).toDateString() : null;
              const showSeparator = currentDate && currentDate !== prevDate;
              return (
                <React.Fragment key={i}>
                  {showSeparator && <DateSeparator date={m.time} />}
                  <ChatMessage from={m.from} text={m.text} time={m.time} theme={theme} replyTo={m.replyTo} />
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: "16px 20px", background: "#fff", borderTop: "1.5px solid #f1f5f9" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your issue..."
              style={{
                flex: 1, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16,
                padding: "12px 16px", outline: "none", fontSize: 14, minHeight: 48, maxHeight: 120,
                resize: "none", transition: "all 0.2s"
              }}
              onFocus={e => { e.target.style.borderColor = theme.accent; e.target.style.background = "#fff"; }}
              onBlur={e  => { e.target.style.borderColor = "#e2e8f0";   e.target.style.background = "#f8fafc"; }}
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              style={{
                width: 48, height: 48, borderRadius: 14,
                background: text.trim() ? theme.gradient : "#f1f5f9",
                color: text.trim() ? "#fff" : "#cbd5e1",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", cursor: text.trim() ? "pointer" : "default",
                transition: "all 0.2s",
                boxShadow: text.trim() ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
              }}
            >
              <FaPaperPlane size={18} />
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 10 }}>Press Enter to send</p>
        </div>
      </div>
    </div>
  );
}
