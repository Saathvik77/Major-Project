import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import api from "../api";

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm Nova, your Smart Life Assistant. I am fully connected to your database now! You can ask me to 'add a task to read a book' or 'delete the gym task', and I'll handle it for you.",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), type: "bot", text }]);
  };

  const handleCommand = async (userInput) => {
    const text = userInput.toLowerCase();
    
    try {
      // 1. ADD TASK PARSING
      if (text.includes("add ") || text.includes("create ") || text.includes("new ")) {
        // Extract what comes after the action word
        let taskTitle = "";
        if (text.includes("add a task to ")) taskTitle = text.split("add a task to ")[1];
        else if (text.includes("add task to ")) taskTitle = text.split("add task to ")[1];
        else if (text.includes("add ")) taskTitle = text.split("add ")[1];
        else if (text.includes("create ")) taskTitle = text.split("create ")[1];
        
        taskTitle = taskTitle.trim();
        // Remove trailing punctiation
        taskTitle = taskTitle.replace(/[.!?]+$/, "");

        if (!taskTitle) {
          addBotMessage("I didn't quite catch the name of the task. Try saying 'Add a task to go grocery shopping'.");
          return;
        }

        addBotMessage(`I'm creating the '${taskTitle}' task for you right now...`);
        
        // Push to DB
        await api.post("/tasks", {
          title: taskTitle,
          description: "Created by Nova AI",
          date: new Date(),
          priority: "Medium",
          duration: 60,
          deadline: new Date(),
          startTime: "09:00"
        });

        // Fire event so Dashboard updates behind the scenes
        window.dispatchEvent(new Event("tasksUpdated"));
        
        setTimeout(() => {
          addBotMessage(`Done! The task '${taskTitle}' has been added to your schedule today. 🚀`);
        }, 1000);
        return;
      }

      // 2. DELETE TASK PARSING
      if (text.includes("delete ") || text.includes("remove ") || text.includes("cancel ")) {
        let fetchWord = "";
        if (text.includes("delete ")) fetchWord = "delete ";
        if (text.includes("remove ")) fetchWord = "remove ";
        if (text.includes("cancel ")) fetchWord = "cancel ";

        let targetTitle = text.split(fetchWord)[1].trim();
        // Remove words like "task" or "the"
        targetTitle = targetTitle.replace(/the /g, "").replace(/task/g, "").trim();
        targetTitle = targetTitle.replace(/[.!?]+$/, "");

        addBotMessage(`Looking for the '${targetTitle}' task in your database...`);

        // Fetch user tasks to find a match
        const res = await api.get("/tasks?limit=50");
        const allTasks = res.data.tasks || [];
        
        // Find best match (case insensitive partial match)
        const match = allTasks.find(t => t.title.toLowerCase().includes(targetTitle));

        if (match) {
          await api.delete(`/tasks/${match._id || match.id}`);
          window.dispatchEvent(new Event("tasksUpdated"));
          
          setTimeout(() => {
            addBotMessage(`Success! I have deleted the '${match.title}' task from your schedule. 🗑️`);
          }, 1000);
        } else {
          setTimeout(() => {
            addBotMessage(`I'm sorry, I couldn't find any pending task that sounds like '${targetTitle}'.`);
          }, 1000);
        }
        return;
      }

      // 3. FALLBACK CONVERSATION
      addBotMessage("I'm an action-oriented assistant! Try giving me a direct command like 'Add a task to call Mom' or 'Delete the email task'.");

    } catch (error) {
      console.error(error);
      addBotMessage("Oops, I lost connection to the database. Something went wrong on my end! 🔌");
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), type: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    // Simulate think delay before parsing commands
    setTimeout(() => {
      setIsTyping(false);
      handleCommand(userText);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[500px] w-full bg-slate-900/40 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative text-white">
      {/* Background glow for the chat window */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10"></div>
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold tracking-wide flex items-center gap-2">
              Nova AI
              <Sparkles size={14} className="text-cyan-400" />
            </h3>
            <p className="text-xs text-cyan-300 font-medium">Online • Connected to Database</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.type === "bot" 
                ? "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
                : "bg-slate-700 border border-white/10"
            }`}>
              {msg.type === "bot" ? <Bot size={16} className="text-white" /> : <User size={16} className="text-gray-300" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.type === "bot" 
                ? "bg-white/10 border border-white/5 text-gray-200 rounded-tl-none shadow-lg" 
                : "bg-gradient-to-r from-primaryTeal to-secondaryCyan text-white rounded-tr-none shadow-md shadow-teal-500/20"
            }`}>
              <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.3)] flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-none px-5 py-4 shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/60 border-t border-white/10 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-2 pl-6 pr-2 focus-within:bg-white/10 focus-within:border-white/20 transition-all">
          <input 
            type="text" 
            placeholder="Tell me what to do..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-medium text-[15px] disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;