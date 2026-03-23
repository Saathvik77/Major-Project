import { useState, useEffect, useRef, useContext } from "react";
import { Send, Bot, User, Sparkles, X, MessageSquareHeart, Zap, Calendar, Dumbbell, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { ThemeContext } from "../ThemeContext";

// Quick-action suggestion chips
const QUICK_CHIPS = [
  { label: "Plan my day", icon: <Calendar size={12} /> },
  { label: "My tasks", icon: <ListChecks size={12} /> },
  { label: "Suggest workout", icon: <Dumbbell size={12} /> },
  { label: "Productivity?", icon: <Zap size={12} /> },
];

function FloatingAICoach({ weatherData, tasks, stats, userName }) {
  const navigate = useNavigate();
  const { setAppTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Hide pulse ring after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  // Initial Greeting & Suggestions on first open
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      setIsTyping(true);

      const pendingCount = tasks?.filter((t) => !t.completed).length || 0;
      let weatherContext = "";

      if (weatherData) {
        const temp = weatherData.temperature;
        const code = weatherData.weathercode;
        if (code <= 2 && temp >= 10 && temp <= 32) weatherContext = "• Weather is perfect for an outdoor run today 🏃‍♂️";
        else if (code >= 51) weatherContext = "• Looks rainy, good time for deep indoor work 🌧️";
        else if (temp < 10 || (code >= 71 && code <= 77)) weatherContext = "• It's chilly out! Stay warm with some indoor stretching ❄️";
        else weatherContext = "• Mild weather, great for a brisk walk 🌤️";
      }

      const suggestionText = `Hello ${userName || "User"} 👋\n\nToday's suggestions:\n• Drink 500ml more water 💧\n• Complete ${pendingCount} pending tasks 📝\n${weatherContext}`;

      setTimeout(() => {
        setIsTyping(false);
        setMessages([{ id: 1, type: "bot", text: suggestionText }]);
      }, 1500);
    }
  }, [isOpen, hasOpened, weatherData, tasks]);

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), type: "bot", text }]);
  };

  const handleCommand = async (userInput) => {
    const text = userInput.toLowerCase();

    try {
      if (text.includes("tired") || text.includes("stress") || text.includes("calm") || text.includes("relax")) {
        addBotMessage("I see you're tired. Let's slow things down...\n\nSwitching to Calm Mode 🌙");
        setTimeout(() => setAppTheme("calm"), 1500);
        return;
      }

      if (text.includes("hype") || text.includes("energy") || text.includes("activate") || text.includes("cyberpunk") || text.includes("hacker")) {
        addBotMessage("System Overload detected. Initializing hyper-productivity protocols ⚡\n\nSwitching to Cyberpunk Mode 🤖");
        setTimeout(() => setAppTheme("cyberpunk"), 1500);
        return;
      }

      if (text.includes("focus") || text.includes("deep work") || text.includes("ocean") || text.includes("flow")) {
        addBotMessage("Entering a state of deep flow. Erasing distractions 🌊\n\nSwitching to Ocean Mode 🐬");
        setTimeout(() => setAppTheme("ocean"), 1500);
        return;
      }

      if (text.includes("add ") || text.includes("create ") || text.includes("new ")) {
        let taskTitle = "";
        if (text.includes("add a task to ")) taskTitle = text.split("add a task to ")[1];
        else if (text.includes("add task to ")) taskTitle = text.split("add task to ")[1];
        else if (text.includes("add ")) taskTitle = text.split("add ")[1];
        else if (text.includes("create ")) taskTitle = text.split("create ")[1];

        taskTitle = taskTitle.trim().replace(/[.!?]+$/, "");

        if (!taskTitle) {
          addBotMessage("I didn't quite catch the name of the task. Try saying 'Add a task to go grocery shopping'.");
          return;
        }

        addBotMessage(`I'm creating the '${taskTitle}' task for you right now...`);

        await api.post("/tasks", {
          title: taskTitle,
          description: "Created by AI",
          date: new Date(),
          duration: 60,
          priority: "Medium",
          deadline: new Date(),
          startTime: "09:00",
        });

        window.dispatchEvent(new Event("tasksUpdated"));

        setTimeout(() => {
          addBotMessage(`Done! The task '${taskTitle}' has been added to your schedule. 🚀`);
        }, 1000);
        return;
      }

      if (text.includes("delete ") || text.includes("remove ") || text.includes("cancel ")) {
        let fetchWord = text.includes("delete ") ? "delete " : text.includes("remove ") ? "remove " : "cancel ";
        let targetTitle = text.split(fetchWord)[1].trim().replace(/the /g, "").replace(/task/g, "").trim().replace(/[.!?]+$/, "");

        addBotMessage(`Looking for the '${targetTitle}' task in your database...`);

        const res = await api.get("/tasks?limit=50");
        const allTasks = res.data.tasks || [];
        const match = allTasks.find((t) => t.title.toLowerCase().includes(targetTitle));

        if (match) {
          await api.delete(`/tasks/${match._id || match.id}`);
          window.dispatchEvent(new Event("tasksUpdated"));
          setTimeout(() => {
            addBotMessage(`Success! I have deleted the '${match.title}' task. 🗑️`);
          }, 1000);
        } else {
          setTimeout(() => {
            addBotMessage(`I couldn't find any pending task that sounds like '${targetTitle}'.`);
          }, 1000);
        }
        return;
      }

      if (text.includes("reschedule ") || text.includes("move ")) {
        let fetchWord = text.includes("reschedule ") ? "reschedule " : "move ";
        // Extract task title and time. Format: "reschedule [title] to [time]"
        let parts = text.split(fetchWord)[1].split(" to ");
        let targetTitle = parts[0].trim().replace(/the /g, "").replace(/task/g, "").trim();
        let targetTimeRaw = parts[1] ? parts[1].trim() : "";

        if (!targetTimeRaw) {
          addBotMessage("Please specify a time, e.g., 'Reschedule reading to 5 PM'.");
          return;
        }

        addBotMessage(`Searching for '${targetTitle}' to reschedule...`);

        const res = await api.get("/tasks?limit=100");
        const allTasks = res.data.tasks || [];
        const match = allTasks.find((t) => t.title.toLowerCase().includes(targetTitle) && !t.completed);

        if (match) {
          // Robust time parsing (simple ver: "5 PM" -> "17:00")
          let formattedTime = targetTimeRaw;
          if (targetTimeRaw.includes("am") || targetTimeRaw.includes("pm")) {
            let [time, modifier] = targetTimeRaw.split(" ");
            let [hours, minutes] = time.split(":");
            if (!minutes) minutes = "00";
            let h = parseInt(hours, 10);
            if (modifier === "pm" && h < 12) h += 12;
            if (modifier === "am" && h === 12) h = 0;
            formattedTime = `${String(h).padStart(2, '0')}:${minutes}`;
          }

          await api.post(`/tasks/${match._id || match.id}/reschedule`, { targetTime: formattedTime });
          window.dispatchEvent(new Event("tasksUpdated"));
          setTimeout(() => {
            addBotMessage(`Task '${match.title}' has been successfully rescheduled to ${targetTimeRaw}. 🗓️`);
          }, 1000);
        } else {
          setTimeout(() => {
            addBotMessage(`I couldn't find a pending task named '${targetTitle}'.`);
          }, 1000);
        }
        return;
      }

      if (text.includes("complete ") || text.includes("finish ") || text.includes("done ")) {
        let fetchWord = text.includes("complete ") ? "complete " : text.includes("finish ") ? "finish " : "done ";
        let targetTitle = text.split(fetchWord)[1].trim().replace(/the /g, "").replace(/task/g, "").trim().replace(/[.!?]+$/, "");

        addBotMessage(`Looking for the '${targetTitle}' task to mark as completed...`);

        const res = await api.get("/tasks?limit=100");
        const allTasks = res.data.tasks || [];
        const match = allTasks.find((t) => t.title.toLowerCase().includes(targetTitle) && !t.completed);

        if (match) {
          await api.patch(`/tasks/${match._id || match.id}`, { completed: true });
          window.dispatchEvent(new Event("tasksUpdated"));
          setTimeout(() => {
            addBotMessage(`Awesome! '${match.title}' is marked as complete. Keep it up! ✅`);
          }, 1000);
        } else {
          setTimeout(() => {
            addBotMessage(`I couldn't find any pending task named '${targetTitle}'.`);
          }, 1000);
        }
        return;
      }

      if (text.includes("go to ") || text.includes("open ") || text.includes("take me to ") || text.includes("navigate to ")) {
        let destination = text.replace(/go to /g, "").replace(/open /g, "").replace(/take me to /g, "").replace(/navigate to /g, "").trim();

        if (destination.includes("task")) {
          addBotMessage(`Opening your Tasks board... 📋`);
          setTimeout(() => navigate("/tasks"), 1000);
          return;
        } else if (destination.includes("report") || destination.includes("health")) {
          addBotMessage(`Opening your Health & Reports... 📊`);
          setTimeout(() => navigate("/reports"), 1000);
          return;
        } else if (destination.includes("analytic")) {
          addBotMessage(`Opening your Analytics dashboard... 📈`);
          setTimeout(() => navigate("/analytics"), 1000);
          return;
        } else if (destination.includes("profile") || destination.includes("setting")) {
          addBotMessage(`Opening your Profile settings... ⚙️`);
          setTimeout(() => navigate("/profile"), 1000);
          return;
        } else if (destination.includes("home") || destination.includes("dashboard")) {
          addBotMessage(`Taking you Home... 🏠`);
          setTimeout(() => navigate("/dashboard"), 1000);
          return;
        }
      }

      if (text.includes("how productive") || text.includes("productivity") || text.includes("my progress")) {
        const productivityPercent = stats && stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) : 0;
        addBotMessage(`You completed ${productivityPercent}% of your tasks today.\nTry finishing 1 more to maintain your streak! 🔥`);
        return;
      }

      if (text.includes("suggest sport") || text.includes("what sport") || text.includes("exercise") || text.includes("workout") || text.includes("suggest workout")) {
        let sportSuggestion = "A 20-minute indoor yoga session is a great way to stay active today. 🧘‍♂️";
        if (weatherData) {
          const temp = weatherData.temperature;
          const code = weatherData.weathercode;

          if (code <= 2 && temp >= 10 && temp <= 32) {
            sportSuggestion = "It's beautifully sunny! I highly suggest a 30-minute outdoor cycling session or a run. 🚴‍♂️🏃‍♀️";
          } else if (code >= 51) {
            sportSuggestion = "It's rainy right now. How about a home HIIT workout or lifting weights at the gym? 🏋️‍♂️";
          } else if (temp < 10 || (code >= 71 && code <= 77)) {
            sportSuggestion = "It's pretty chilly outside! A nice warm indoor yoga or stretching session is perfect. 🧘‍♀️";
          } else {
            sportSuggestion = "Mild weather. A brisk outdoor walk or a light jog would be excellent. 🚶‍♂️";
          }
        }
        addBotMessage(sportSuggestion);
        return;
      }

      if (text.includes("plan my day") || text.includes("schedule") || text.includes("when should i work")) {
        const pending = tasks?.filter((t) => !t.completed).length || 0;
        addBotMessage(`You are most productive between 9AM–11AM. Schedule important work during this time.\nYou currently have ${pending} pending tasks left. 📅`);
        return;
      }

      if (text.includes("my tasks") || text.includes("list tasks") || text.includes("show tasks")) {
        const pending = tasks?.filter((t) => !t.completed) || [];
        if (pending.length === 0) {
          addBotMessage("You have no pending tasks right now. Great job! 🎉");
        } else {
          const list = pending.slice(0, 5).map((t, i) => `${i + 1}. ${t.title}`).join("\n");
          addBotMessage(`Here are your pending tasks:\n${list}${pending.length > 5 ? `\n...and ${pending.length - 5} more.` : ""}`);
        }
        return;
      }

      if (text.includes("health") || text.includes("how healthy")) {
        addBotMessage("Your health score improved by 12% this week. Great job staying active! 💚");
        return;
      }

      addBotMessage("I am a Smart Assistant! Ask me to 'Add a task to read', 'Finish the coding task', or 'Take me to Reports'.");
    } catch (error) {
      console.error(error);
      addBotMessage("Oops, I lost connection to the database. Something went wrong on my end! 🔌");
    }
  };

  const handleSend = (text) => {
    const userText = (text || input).trim();
    if (!userText) return;

    setMessages((prev) => [...prev, { id: Date.now(), type: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      handleCommand(userText);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Chat Window Popup ──────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.88, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 w-[350px] sm:w-[410px] h-[530px] flex flex-col overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] relative"
            style={{ background: "linear-gradient(145deg, rgba(5,8,15,0.98) 0%, rgba(2,4,10,0.99) 100%)", backdropFilter: "blur(24px)" }}
          >
            {/* Subtle top glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-neonPrimary/50 to-transparent" />

            {/* ── Chat Header ─────────────────────────────────────── */}
            <div className="relative px-5 py-4 border-b border-white/[0.07] overflow-hidden flex-shrink-0">
              {/* Animated gradient header bg */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-pink-600/10 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(124,108,255,0.18),transparent_60%)] pointer-events-none" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* AI avatar with pulse ring */}
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                      <Bot size={20} className="text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wide flex items-center gap-1.5">
                      AI Coach
                      <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-emerald-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      Online & Ready
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── Messages Area ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex items-end gap-2.5 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.type === "bot"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                        : "bg-slate-700 border border-white/10"
                        }`}
                    >
                      {msg.type === "bot" ? (
                        <Bot size={13} className="text-white" />
                      ) : (
                        <User size={13} className="text-gray-300" />
                      )}
                    </div>

                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 ${msg.type === "bot"
                        ? "bg-white/[0.07] border border-white/[0.08] text-gray-200 rounded-bl-none shadow-lg"
                        : "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md shadow-indigo-500/20"
                        }`}
                    >
                      <p className="text-[13.5px] leading-relaxed whitespace-pre-line font-medium">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.4)] flex items-center justify-center flex-shrink-0">
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="bg-white/[0.07] border border-white/[0.08] rounded-2xl rounded-bl-none px-4 py-3.5 shadow-lg flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Action Chips ───────────────────────────────── */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleSend(chip.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] border border-white/[0.10] rounded-full text-[11px] font-semibold text-gray-300 hover:bg-neonPrimary/20 hover:border-neonPrimary/40 hover:text-white transition-all duration-200"
                  >
                    {chip.icon}
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input Area ────────────────────────────────────────── */}
            <div className="p-4 border-t border-white/[0.07] flex-shrink-0" style={{ background: "rgba(4,6,10,0.8)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 pl-4 focus-within:bg-white/[0.07] focus-within:border-neonPrimary/30 transition-all duration-300">
                <input
                  type="text"
                  placeholder="Ask AI Coach anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isTyping}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 font-medium text-[13px] disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-400 hover:to-purple-500 transition-all duration-200 shadow-[0_0_12px_rgba(99,102,241,0.4)] hover:shadow-[0_0_18px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Toggle Button ───────────────────────────────────── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`relative flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3.5 rounded-2xl shadow-[0_0_24px_rgba(99,102,241,0.45)] hover:shadow-[0_0_32px_rgba(99,102,241,0.65)] font-bold tracking-wide z-50 transition-all duration-300 ${isOpen ? "opacity-0 scale-90 pointer-events-none absolute" : "opacity-100 scale-100"
          }`}
      >
        {/* Pulse ring when not opened yet */}
        {showPulse && (
          <>
            <span className="absolute inset-0 rounded-2xl animate-ping bg-indigo-500 opacity-25 pointer-events-none" />
            <span className="absolute inset-0 rounded-2xl animate-ping bg-purple-500 opacity-15 pointer-events-none" style={{ animationDelay: "0.4s" }} />
          </>
        )}
        <MessageSquareHeart size={20} className="animate-pulse" />
        AI Coach
        <Sparkles size={13} className="text-indigo-300" />
      </motion.button>
    </div>
  );
}

export default FloatingAICoach;
