import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import DateSeparator from '../components/DateSeparator'
import api from '../api';
import { FaPaperPlane, FaHeadset, FaCommentAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const defaultTheme = { gradient: "linear-gradient(135deg,#00D4AA,#7C3AED)", accent: "#00D4AA" };

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes chatOrb {
    0%,100% { transform:translate(0,0) scale(1); }
    33% { transform:translate(14px,-14px) scale(1.06); }
    66% { transform:translate(-8px,10px) scale(0.95); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .chat-card  { animation: slideUp 0.5s cubic-bezier(.22,.68,0,1.2) both; }
  .chat-scroll { scroll-behavior: smooth; }
  .chat-scroll::-webkit-scrollbar { width: 5px; }
  .chat-scroll::-webkit-scrollbar-track { background: transparent; }
  .chat-scroll::-webkit-scrollbar-thumb { background: rgba(0,212,170,0.25); border-radius: 10px; }
  .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,212,170,0.5); }

  .chat-input:-webkit-autofill,
  .chat-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px rgba(15,23,42,0.9) inset !important;
    -webkit-text-fill-color: #F1F5F9 !important;
  }

  .send-btn:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 24px rgba(0,212,170,0.5) !important;
  }
  .contact-card:hover {
    border-color: rgba(0,212,170,0.4) !important;
    background: rgba(0,212,170,0.08) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
`;

export default function ChatSupport() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [theme, setTheme] = useState(defaultTheme);
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

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

      if (qs.some(q => (q.isFromAdmin || q.fromAdmin) && !q.readByUser)) {
        api.userMarkQueriesAsRead().then(() => {
          window.dispatchEvent(new Event('chatRead'));
        }).catch(() => {});
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const init = async () => {
      try {
        const u = await api.getCurrentUser();
        setUser(u);
        await api.userMarkQueriesAsRead();
        window.dispatchEvent(new Event('chatRead'));

        const partners = await api.getPartners();
        if (Array.isArray(partners)) {
          const p = partners.find(ptr => ptr.name === u.platform);
          if (p?.borderColor) {
            setTheme({
              gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`,
              accent: p.borderColor,
            });
          }
        }
        await loadMessages();
      } catch (e) { console.error(e); }
    };

    init();
    const poll = setInterval(loadMessages, 5000);
    return () => clearInterval(poll);
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    const tempText = text;
    setText('');
    setSending(true);
    try {
      await api.postQuery(tempText);
      await loadMessages();
    } catch (e) {
      console.error(e);
      setText(tempText);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = async () => {
    if (!window.confirm("Are you sure you want to clear your chat history? This cannot be undone.")) return;
    try {
      if (api.userClearChat) await api.userClearChat();
      setMessages([]);
    } catch (e) { alert("Failed to clear chat"); }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px", minHeight: "100vh" }}>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          background: "linear-gradient(135deg,#00D4AA,#7C3AED)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          boxShadow: "0 0 20px rgba(0,212,170,0.35)",
        }}>
          <FaHeadset size={22} />
        </div>
        <div>
          <h2 style={{
            fontFamily: "Sora,sans-serif", fontSize: 24, fontWeight: 800,
            color: "#FFFFFF", margin: 0,
            background: "linear-gradient(135deg,#F1F5F9,#94A3B8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Support Center</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, fontWeight: 500 }}>
            We're here to help you — replies usually within minutes
          </p>
        </div>
      </div>

      {/* ── Contact Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {/* Phone */}
        <a
          href="tel:9550901599"
          className="contact-card"
          style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 16, padding: "16px 18px",
            textDecoration: "none",
            transition: "all 0.2s",
            cursor: "pointer",
          }}
        >
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: "rgba(0,212,170,0.12)",
            border: "1px solid rgba(0,212,170,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(0,212,170,0.15)",
          }}>
            <FaPhone size={16} color="#00D4AA" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>Call Us</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#00D4AA", fontFamily: "'Sora', sans-serif" }}>9550901599</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Mon–Sat, 9am–6pm IST</div>
          </div>
        </a>

        {/* Email */}
        <a
          href="mailto:gigprotectiontrails@gmail.com"
          className="contact-card"
          style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 16, padding: "16px 18px",
            textDecoration: "none",
            transition: "all 0.2s",
            cursor: "pointer",
          }}
        >
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(124,58,237,0.15)",
          }}>
            <FaEnvelope size={16} color="#A78BFA" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>Email Us</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#A78BFA", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>gigprotectiontrails@gmail.com</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Reply within 24 hours</div>
          </div>
        </a>
      </div>

      {/* ── Chat Card ── */}
      <div
        className="chat-card"
        style={{
          background: "rgba(13,21,38,0.95)",
          borderRadius: 24, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,170,0.06)",
          display: "flex", flexDirection: "column",
          height: "calc(100vh - 220px)", minHeight: 520,
          position: "relative",
        }}
      >
        {/* Top gradient bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #00D4AA, #7C3AED, #00D4AA)", flexShrink: 0 }} />

        {/* Online Status Bar */}
        <div style={{
          padding: "10px 20px",
          background: "rgba(0,212,170,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>
            GigShield Support Online
          </span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Messages ── */}
        <div
          ref={scrollRef}
          className="chat-scroll"
          style={{
            flex: 1, overflowY: "auto", padding: "20px 18px",
            background: "linear-gradient(180deg, #080E1C 0%, #060B18 100%)",
            backgroundImage: "radial-gradient(rgba(0,212,170,0.03) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          {messages.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", textAlign: "center", padding: 40,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
                boxShadow: "0 0 32px rgba(0,212,170,0.15)",
              }}>
                <FaCommentAlt size={28} style={{ color: "#00D4AA" }} />
              </div>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 18, color: "#F1F5F9", margin: "0 0 8px" }}>
                Start a conversation
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6, maxWidth: 280 }}>
                Ask a question below and our support team will get back to you shortly.
              </p>
            </div>
          ) : (
            messages.map((m, i) => {
              const currentDate = m.time ? new Date(m.time).toDateString() : null;
              const prevDate    = i > 0 && messages[i-1].time ? new Date(messages[i-1].time).toDateString() : null;
              const showSep     = currentDate && currentDate !== prevDate;
              return (
                <React.Fragment key={i}>
                  {showSep && <DateSeparator date={m.time} />}
                  <ChatMessage from={m.from} text={m.text} time={m.time} theme={theme} replyTo={m.replyTo} />
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* ── Input Area ── */}
        <div style={{
          padding: "14px 18px",
          background: "rgba(10,16,32,0.98)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <textarea
              ref={textareaRef}
              className="chat-input"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your issue…"
              rows={1}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: "11px 16px",
                outline: "none",
                fontSize: 14,
                color: "#F1F5F9",
                fontFamily: "'Inter', sans-serif",
                minHeight: 46, maxHeight: 120,
                resize: "none",
                transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                lineHeight: 1.5,
              }}
              onFocus={e => {
                e.target.style.borderColor = "#00D4AA";
                e.target.style.boxShadow = "0 0 0 3px rgba(0,212,170,0.12)";
                e.target.style.background = "rgba(0,212,170,0.04)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                e.target.style.boxShadow = "none";
                e.target.style.background = "rgba(255,255,255,0.05)";
              }}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="send-btn"
              style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: text.trim() && !sending
                  ? "linear-gradient(135deg, #00D4AA, #7C3AED)"
                  : "rgba(255,255,255,0.06)",
                color: text.trim() && !sending ? "#fff" : "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none",
                cursor: text.trim() && !sending ? "pointer" : "default",
                transition: "all 0.2s",
                boxShadow: text.trim() && !sending ? "0 4px 16px rgba(0,212,170,0.35)" : "none",
              }}
            >
              {sending
                ? <svg style={{ width: 18, height: 18, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                : <FaPaperPlane size={16} />
              }
            </button>
          </div>
          <p style={{
            fontSize: 11, color: "rgba(255,255,255,0.3)",
            textAlign: "center", marginTop: 8, fontFamily: "'Inter', sans-serif",
          }}>
            Press <kbd style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>Enter</kbd> to send · <kbd style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
