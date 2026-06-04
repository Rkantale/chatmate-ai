import { useState, useRef, useEffect } from "react";

const AGENT_NAME = "AI Assistant";
const AGENT_AVATAR = "🤖";

const systemPrompt = `You are a helpful WhatsApp AI assistant. Keep responses concise and conversational — like real WhatsApp messages. Use short paragraphs. You can use emojis naturally. Be frie[...]

function TypingIndicator() {
  return (
    <div style={styles.typingRow}>
      <div style={styles.avatar}>{AGENT_AVATAR}</div>
      <div style={styles.typingBubble}>
        <span style={{ ...styles.dot, animationDelay: "0s" }} />
        <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
        <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function WhatsAppAgent() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hey! 👋 I'm your AI assistant. How can I help you today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "YOUR_KEY_HERE",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: history,
        }),
      });

      const data = await res.json();
      const reply = data.content?.map((c) => c.text || "").join("") || "Sorry, I couldn't respond. 😕";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: reply, time: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: "Oops! Something went wrong. Please try again. 😅", time: new Date() },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={styles.phone}>
      {/* Status bar */}
      <div style={styles.statusBar}>
        <span>9:41</span>
        <span>📶 🔋</span>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.backArrow}>‹</div>
          <div style={styles.headerAvatar}>{AGENT_AVATAR}</div>
          <div>
            <div style={styles.headerName}>{AGENT_NAME}</div>
            <div style={styles.headerStatus}>online</div>
          </div>
        </div>
        <div style={styles.headerIcons}>
          <span style={styles.iconBtn}>📹</span>
          <span style={styles.iconBtn}>📞</span>
          <span style={styles.iconBtn}>⋮</span>
        </div>
      </div>

      {/* Chat area */}
      <div style={styles.chatArea}>
        {/* Date badge */}
        <div style={styles.dateBadge}>TODAY</div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={msg.role === "user" ? styles.userRow : styles.agentRow}
          >
            {msg.role === "assistant" && (
              <div style={styles.avatar}>{AGENT_AVATAR}</div>
            )}
            <div
              style={
                msg.role === "user" ? styles.userBubble : styles.agentBubble
              }
            >
              <p style={styles.bubbleText}>{msg.text}</p>
              <div style={styles.bubbleMeta}>
                <span style={styles.timeText}>{formatTime(msg.time)}</span>
                {msg.role === "user" && (
                  <span style={styles.ticks}>✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={styles.inputBar}>
        <span style={styles.emojiBtn}>😊</span>
        <textarea
          ref={inputRef}
          style={styles.textInput}
          placeholder="Message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <span style={styles.attachBtn}>📎</span>
        <button
          style={input.trim() ? styles.sendBtn : styles.micBtn}
          onClick={sendMessage}
          disabled={loading}
        >
          {input.trim() ? "➤" : "🎤"}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        textarea:focus { outline: none; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}

const styles = {
  phone: {
    maxWidth: 390,
    margin: "0 auto",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#ECE5DD",
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
    overflow: "hidden",
    position: "relative",
  },
  statusBar: {
    background: "#075E54",
    color: "white",
    fontSize: 12,
    padding: "4px 16px",
    display: "flex",
    justifyContent: "space-between",
    letterSpacing: 0.5,
  },
  header: {
    background: "#075E54",
    padding: "8px 12px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  backArrow: {
    color: "white",
    fontSize: 28,
    lineHeight: 1,
    cursor: "pointer",
    marginRight: 2,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#25D366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  headerName: {
    color: "white",
    fontWeight: 600,
    fontSize: 15,
  },
  headerStatus: {
    color: "#B2DFDB",
    fontSize: 12,
  },
  headerIcons: {
    display: "flex",
    gap: 16,
  },
  iconBtn: {
    fontSize: 18,
    cursor: "pointer",
    opacity: 0.9,
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 10px",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5b5a8' f[...]
  },
  dateBadge: {
    textAlign: "center",
    margin: "8px 0 12px",
    fontSize: 11,
    color: "#666",
    background: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    padding: "3px 10px",
    display: "inline-block",
    width: "fit-content",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    justifyContent: "center",
  },
  agentRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 6,
  },
  userRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#25D366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
    marginBottom: 2,
  },
  agentBubble: {
    background: "white",
    borderRadius: "0px 10px 10px 10px",
    padding: "7px 10px 5px",
    maxWidth: "75%",
    boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
    position: "relative",
  },
  userBubble: {
    background: "#DCF8C6",
    borderRadius: "10px 0px 10px 10px",
    padding: "7px 10px 5px",
    maxWidth: "75%",
    boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
  },
  bubbleText: {
    fontSize: 14,
    color: "#303030",
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  bubbleMeta: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  timeText: {
    fontSize: 11,
    color: "#8C8C8C",
  },
  ticks: {
    fontSize: 12,
    color: "#4FC3F7",
  },
  typingRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 6,
  },
  typingBubble: {
    background: "white",
    borderRadius: "0px 10px 10px 10px",
    padding: "12px 14px",
    display: "flex",
    gap: 4,
    boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#999",
    display: "inline-block",
    animation: "bounce 1.2s infinite ease-in-out",
  },
  inputBar: {
    background: "#F0F0F0",
    padding: "8px 8px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderTop: "1px solid #ddd",
  },
  emojiBtn: {
    fontSize: 22,
    cursor: "pointer",
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    background: "white",
    border: "none",
    borderRadius: 20,
    padding: "9px 14px",
    fontSize: 14,
    resize: "none",
    maxHeight: 80,
    lineHeight: 1.4,
    fontFamily: "inherit",
    color: "#303030",
  },
  attachBtn: {
    fontSize: 20,
    cursor: "pointer",
    flexShrink: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#25D366",
    border: "none",
    color: "white",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    paddingLeft: 3,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#25D366",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};


