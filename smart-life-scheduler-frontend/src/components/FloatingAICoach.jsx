import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, X, MessageSquareHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function FloatingAICoach({ weatherData, tasks, stats, userName }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Initial Greeting & Suggestions on first open
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      setIsTyping(true);

      const pendingCount = tasks?.filter(t => !t.completed).length || 0;
      let weatherContext = "";

      if (weatherData) {
        const temp = weatherData.temperature;
        const code = weatherData.weathercode;
        if (code <= 2 && temp >= 10 && temp <= 32) weatherContext = "• Weather is perfect for an outdoor run today 🏃‍♂️";
        else if (code >= 51) weatherContext = "• Looks rainy, good time for deep indoor work 🌧️";
        else if (temp < 10 || (code >= 71 && code <= 77)) weatherContext = "• It's chilly out! Stay warm with some indoor stretching ❄️";
        else weatherContext = "• Mild weather, great for a brisk walk 🌤️";
      }

      const suggestionText = `Hello ${userName || 'User'} 👋\n\nToday's suggestions:\n• Drink 500ml more water 💧\n• Complete ${pendingCount} pending tasks 📝\n${weatherContext}`;

      setTimeout(() => {
        setIsTyping(false);
        setMessages([
          {
            id: 1,
            type: "bot",
            text: suggestionText,
          }
        ]);
      }, 1500);
    }
  }, [isOpen, hasOpened, weatherData, tasks]);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), type: "bot", text }]);
  };

  const handleCommand = async (userInput) => {
    const text = userInput.toLowerCase();

    try {
      // Create Task
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
          startTime: "09:00"
        });

        window.dispatchEvent(new Event("tasksUpdated"));

        setTimeout(() => {
          addBotMessage(`Done! The task '${taskTitle}' has been added to your schedule. 🚀`);
        }, 1000);
        return;
      }

      // Delete Task
      if (text.includes("delete ") || text.includes("remove ") || text.includes("cancel ")) {
        let fetchWord = text.includes("delete ") ? "delete " : text.includes("remove ") ? "remove " : "cancel ";
        let targetTitle = text.split(fetchWord)[1].trim().replace(/the /g, "").replace(/task/g, "").trim().replace(/[.!?]+$/, "");

        addBotMessage(`Looking for the '${targetTitle}' task in your database...`);

        const res = await api.get("/tasks?limit=50");
        const allTasks = res.data.tasks || [];
        const match = allTasks.find(t => t.title.toLowerCase().includes(targetTitle));

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

      // Complete Task
      if (text.includes("complete ") || text.includes("finish ") || text.includes("done ")) {
        let fetchWord = text.includes("complete ") ? "complete " : text.includes("finish ") ? "finish " : "done ";
        let targetTitle = text.split(fetchWord)[1].trim().replace(/the /g, "").replace(/task/g, "").trim().replace(/[.!?]+$/, "");

        addBotMessage(`Looking for the '${targetTitle}' task to mark as completed...`);

        const res = await api.get("/tasks?limit=50");
        const allTasks = res.data.tasks || [];
        const match = allTasks.find(t => t.title.toLowerCase().includes(targetTitle) && !t.completed);

        if (match) {
          await api.put(`/tasks/${match._id || match.id}`, { ...match, completed: true });
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

      // Edit Task Priority
      if (text.includes("change priority") || text.includes("make it ") || text.includes("set priority to ")) {
        addBotMessage("I can update task priority for you. Please say 'Make the [Task Name] task high priority'.");
        return;
      }

      // Navigate Application
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

      // Smart Questions Parsing
      if (text.includes("how productive") || text.includes("productivity") || text.includes("my progress")) {
        const productivityPercent = stats && stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) : 0;
        addBotMessage(`You completed ${productivityPercent}% of your tasks today.\nTry finishing 1 more to maintain your streak! 🔥`);
        return;
      }

      if (text.includes("suggest sport") || text.includes("what sport") || text.includes("exercise") || text.includes("workout")) {
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
        const pending = tasks?.filter(t => !t.completed).length || 0;
        addBotMessage(`You are most productive between 9AM–11AM. Schedule important work during this time.\nYou currently have ${pending} pending tasks left. 📅`);
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

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), type: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      handleCommand(userText);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window Popup */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 transform origin-bottom-right">

          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-wide flex items-center gap-2">
                  AI Coach
                  <Sparkles size={14} className="text-indigo-400" />
                </h3>
                <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === "bot"
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                    : "bg-slate-700 border border-white/10"
                  }`}>
                  {msg.type === "bot" ? <Bot size={15} className="text-white" /> : <User size={15} className="text-gray-300" />}
                </div>

                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.type === "bot"
                    ? "bg-white/10 border border-white/5 text-gray-200 rounded-tl-none shadow-lg"
                    : "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/20"
                  }`}>
                  <p className="text-[14px] leading-relaxed whitespace-pre-line font-medium drop-shadow-sm">{msg.text}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.3)] flex items-center justify-center flex-shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900/60 border-t border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1.5 pl-5 focus-within:bg-white/10 focus-within:border-white/20 transition-all">
              <input
                type="text"
                placeholder="Message AI Coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isTyping}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-medium text-[14px] disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-400 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.4)]"
              >
                <Send size={15} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3.5 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:scale-105 transition-all duration-300 font-bold tracking-wide z-50 ${isOpen ? 'opacity-0 scale-90 pointer-events-none absolute' : 'opacity-100 scale-100'}`}
      >
        <MessageSquareHeart size={20} className="animate-pulse" />
        AI Coach
      </button>
    </div>
  );
}

export default FloatingAICoach;
