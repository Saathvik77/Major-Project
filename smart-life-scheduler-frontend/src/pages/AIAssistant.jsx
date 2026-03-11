import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Bot, Sparkles, User, Zap, ClipboardList, Calendar, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { ThemeContext } from "../ThemeContext";

function AIAssistant() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Smart Life Assistant. I can help you manage your tasks, schedule your day, or provide productivity insights. What would you like to do today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // In a real scenario, this would call a specialized endpoint that can execute tasks.
      // For now, we'll simulate task-based intelligence using the existing chatbot logic or a mockup.
      const response = await api.post("/ai/chat", { message: input });
      const assistantMessage = {
        role: "assistant",
        content: response.data.reply || "I've processed your request. Is there anything else I can help with?",
        actions: response.data.actions || [], // Simulated actions like "taskCreated"
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If the AI performed a task, we might want to trigger a refresh elsewhere
      if (response.data.actions?.length > 0) {
        window.dispatchEvent(new Event("tasksUpdated"));
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error processing your request. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 text-white relative flex flex-col max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Bot className="text-neonPrimary drop-shadow-[0_0_10px_rgba(124,108,255,0.6)]" />
            AI Smart Assistant
          </h1>
          <p className="text-gray-400 text-sm font-medium">Your personal life coach & task manager</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <ClipboardList size={18} />, label: "Add Task", prompt: "Add a task to buy groceries tomorrow" },
          { icon: <Calendar size={18} />, label: "Schedule Day", prompt: "Help me plan my day for maximum productivity" },
          { icon: <Zap size={18} />, label: "Quick Tip", prompt: "Give me a quick productivity tip" },
          { icon: <CheckCircle2 size={18} />, label: "Summary", prompt: "Summarize my progress for today" },
        ].map((action, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInput(action.prompt)}
            className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-neonPrimary/30 transition-all text-xs font-bold uppercase tracking-wider text-gray-300"
          >
            {action.icon}
            {action.label}
          </motion.button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-slate-900/40 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl p-4 md:p-6 overflow-hidden flex flex-col mb-6 min-h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl flex gap-3 ${
                    msg.role === "user"
                      ? "bg-neonPrimary/20 border border-neonPrimary/30 text-white"
                      : "bg-white/5 border border-white/10 text-gray-200"
                  }`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {msg.role === "user" ? <User size={18} className="text-neonPrimary" /> : <Bot size={18} className="text-neonAccent" />}
                  </div>
                  <div>
                    <p className="text-sm md:text-base leading-relaxed font-medium">{msg.content}</p>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                        {msg.actions.map((act, i) => (
                          <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/30">
                            {act}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-neonAccent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-neonAccent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-neonAccent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-6 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me to schedule tasks or plan your day..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-white placeholder:text-gray-500 focus:outline-none focus:border-neonPrimary/50 transition-all shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-neonPrimary rounded-xl text-white shadow-[0_0_15px_rgba(124,108,255,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-6 text-center">
        <div className="flex items-center gap-1"><Sparkles size={12} className="text-neonHighlight" /> Advanced AI Processing</div>
        <div className="w-1 h-1 bg-white/10 rounded-full"></div>
        <div>Real-time Task Execution Enabled</div>
      </div>
    </div>
  );
}

export default AIAssistant;
