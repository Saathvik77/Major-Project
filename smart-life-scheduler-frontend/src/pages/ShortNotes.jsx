import { useState, useEffect, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Pin, 
  Sparkles, 
  BookOpen, 
  Trash2,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import Toast from "../components/Toast";


const StickyNote = ({ note, convertToTask, updateNoteColor, deleteNote }) => {
  const timeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} mins ago`;
    return `${Math.floor(diff / 60)} hours ago`;
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9, rotate: Math.random() * 4 - 2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      className="relative w-full max-w-sm group"
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-lime-500 drop-shadow-xl">
         <Pin size={28} fill="currentColor" className="rotate-45" />
      </div>
      
      <div className={`p-6 pt-8 rounded-sm shadow-2xl relative overflow-hidden flex flex-col min-h-[300px] border-b-4 border-r-4 border-black/10 transition-colors duration-200`}
           style={{ backgroundColor: note.color || '#d9e87b' }}>
         {/* Line pattern */}
         <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,rgba(0,0,0,0.1)_28px)] bg-[length:100%_28px] opacity-20 pointer-events-none" />
         <div className="absolute left-10 top-0 bottom-0 w-px bg-rose-400 opacity-30 pointer-events-none" />

         <div className="relative z-10 flex flex-col h-full">
            <h4 className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               Short Note
            </h4>
            
            <p className="text-black/80 font-medium leading-[28px] flex-1 mb-6 text-sm">
              {note.content}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
               {note.tags.map(tag => (
                 <span key={tag} className="px-3 py-1 rounded-full bg-black/10 text-black/60 text-[10px] font-black uppercase tracking-wide">
                   # {tag}
                 </span>
               ))}
            </div>

            <div className="border-t border-[#5a6b1d]/20 pt-4 flex flex-col gap-3">
               <button 
                 onClick={() => convertToTask(note)}
                 disabled={note.convertedToTask}
                 className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${note.convertedToTask ? 'opacity-40' : 'text-black/60 hover:text-black hover:translate-x-1 transition-all'}`}
               >
                 {note.convertedToTask ? <CheckCircle size={14} /> : <ArrowRight size={14} />}
                 {note.convertedToTask ? "Converted to Task" : "Convert to Task"}
               </button>
               
               <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-bold text-black/40 flex items-center gap-1">
                     <Clock size={10} /> Saved {timeAgo(note.createdAt)}
                  </span>
                  <div className="flex gap-2">
                     <div className="flex gap-1 items-center bg-black/5 p-1 rounded-lg">
                       {[
                         '#d9e87b', // Lime
                         '#ff7eb9', // Pink
                         '#7afcff', // Blue-green
                         '#feff9c', // Yellow
                         '#ffcc80', // Orange
                       ].map(c => (
                         <button
                           key={c}
                           onClick={() => updateNoteColor(note._id, c)}
                           className={`w-4 h-4 rounded-full border border-black/10 transition-transform hover:scale-125 ${note.color === c ? 'scale-110 ring-2 ring-black/20' : ''}`}
                           style={{ backgroundColor: c }}
                         />
                       ))}
                     </div>
                     <button 
                       onClick={() => deleteNote(note._id)}
                       className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-700 hover:bg-rose-500/20 transition-all"
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
               </div>
            </div>
         </div>

          {/* Corner fold effect */}
          <div className="absolute bottom-0 right-0 w-12 h-12 opacity-30 rounded-tl-sm shadow-[-5px_-5px_15px_rgba(0,0,0,0.05)]" 
               style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
      </div>
    </motion.div>
  );
};

export default function ShortNotes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTags, setActiveTags] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#d9e87b");

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await api.get(`/notes?date=${dateStr}`);
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error("Fetch Notes Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await api.post("/notes", {
        content: newNote,
        date: selectedDate,
        tags: activeTags,
        color: selectedColor,
      });
      setNotes([res.data.note, ...notes]);
      setNewNote("");
      setActiveTags([]);
      setSelectedColor("#d9e87b");
      setToast("Note synchronized to matrix ✨");
    } catch (err) {
      console.error(err);
      setToast("Failed to save note. Link unstable.");
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
      setToast("Note purged from memory.");
    } catch (err) {
      setToast("Deletion failed.");
    }
  };

  const convertToTask = async (note) => {
    if (note.content.length < 3) {
      setToast("Note too short for task matrix expansion (min 3 chars).");
      return;
    }
    try {
      await api.post("/tasks", {
        title: note.content,
        date: selectedDate,
        priority: "Medium",
        category: note.tags[0] || "General",
        startTime: "09:00",
        duration: 30,
      });
      await api.put(`/notes/${note._id}`, { convertedToTask: true });
      setNotes(notes.map(n => n._id === note._id ? { ...n, convertedToTask: true } : n));
      setToast("Note upgraded to active objective 🚀");
    } catch (err) {
      setToast("Conversion failed.");
    }
  };

  const updateNoteColor = async (id, newColor) => {
    // Optimistic update
    const previousNotes = [...notes];
    setNotes(notes.map(n => n._id === id ? { ...n, color: newColor } : n));
    
    try {
      await api.put(`/notes/${id}`, { color: newColor });
    } catch (err) {
      setNotes(previousNotes);
      setToast("Color synchronization failed.");
    }
  };

  const generateWeek = (baseDate) => {
    const week = [];
    const cur = new Date(baseDate);
    cur.setDate(cur.getDate() - 3);
    for (let i = 0; i < 7; i++) { 
        week.push(new Date(cur)); 
        cur.setDate(cur.getDate() + 1); 
    }
    return week;
  };

  const weekDates = generateWeek(selectedDate);


  return (
    <div className="min-h-screen pl-0 md:pl-20 p-4 sm:p-6 md:p-8 lg:p-12 text-white relative flex flex-col w-full xl:max-w-7xl xl:mx-auto pb-28 md:pb-10 page-transition">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header className="flex items-center justify-between gap-4 relative z-10 mb-8 md:mb-16">
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[2rem] bg-gradient-to-br from-lime-500 to-yellow-600 flex items-center justify-center text-white shadow-2xl shadow-yellow-500/20 shrink-0">
            <BookOpen size={20} className="md:w-8 md:h-8" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter truncate">Short Notes</h1>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide mt-1 text-lime-500/60 font-black truncate">Quick Thoughts & Snippets</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
           <div className="hidden sm:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <button onClick={() => {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 1);
                setSelectedDate(prev);
              }} className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400">
                <ChevronLeft size={16} />
              </button>
              <div className="px-4 py-1.5 bg-lime-500 text-white rounded-xl text-xs font-black uppercase tracking-wide">
                {selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
              </div>
              <button onClick={() => {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 1);
                setSelectedDate(next);
              }} className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400">
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 relative z-10">
         {/* Input Column */}
         <div className="col-span-1 lg:col-span-4 flex flex-col gap-8">
            <div className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 blur-[40px] -z-10" />
               <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wide text-gray-500">New Thought</h4>
                  <Sparkles size={14} className="text-lime-500 animate-pulse" />
               </div>
               
               <textarea 
                 value={newNote}
                 onChange={(e) => setNewNote(e.target.value)}
                 placeholder="Buffer your consciousness... Enter a new note."
                 className="min-h-[150px] bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white placeholder:text-gray-700 leading-relaxed outline-none focus:border-lime-500/30 transition-all resize-none"
               />

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Note Color</label>
                  <div className="flex gap-2">
                    {[
                      '#d9e87b', // Lime
                      '#ff7eb9', // Pink
                      '#7afcff', // Blue-green
                      '#feff9c', // Yellow
                      '#ffcc80', // Orange
                    ].map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-6 h-6 rounded-full border border-white/10 transition-transform hover:scale-110 ${selectedColor === c ? 'scale-125 ring-2 ring-lime-500' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Classification Tags</label>
                  <div className="flex flex-wrap gap-2">
                     {['Work', 'Health', 'Personal', 'Ideas'].map(tag => (
                       <button
                         key={tag}
                         onClick={() => {
                           if (activeTags.includes(tag)) setActiveTags(activeTags.filter(t => t !== tag));
                           else setActiveTags([...activeTags, tag]);
                         }}
                         className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all ${activeTags.includes(tag) ? 'bg-lime-500 border-lime-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                       >
                         {tag}
                       </button>
                     ))}
                  </div>
               </div>

               <button 
                 onClick={addNote}
                 disabled={!newNote.trim()}
                 className="w-full py-4 bg-lime-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-lime-500/20 hover:bg-lime-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
               >
                 <Plus size={16} strokeWidth={3} />
                 Sync Note
               </button>
            </div>

            <div className="glass-card p-8 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
               <h4 className="text-xs font-black uppercase tracking-wide text-yellow-500 mb-4">Node Statistics</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Total Notes</p>
                     <p className="text-2xl font-black text-white">{notes.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Date Nodes</p>
                     <p className="text-2xl font-black text-white">1</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Grid Column */}
         <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">
            <div className="glass-card p-6 flex items-center gap-4 overflow-x-auto scrollbar-hide snap-x">
               {weekDates.map((d, i) => {
                  const isActive = d.toDateString() === selectedDate.toDateString();
                  return (
                    <button 
                      key={i}
                      onClick={() => setSelectedDate(new Date(d))}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-2xl border transition-all shrink-0 snap-center ${isActive ? 'bg-lime-500 border-lime-500 shadow-lg shadow-lime-500/20 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                    >
                       <span className="text-[10px] font-black uppercase tracking-tighter mb-1">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                       <span className="text-lg font-black">{d.getDate()}</span>
                    </button>
                  );
               })}
            </div>

            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-[300px] bg-white/5 rounded-2xl animate-pulse" />
                  ))}
               </div>
            ) : notes.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center mb-6">
                     <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">No Active Thoughts</h3>
                  <p className="text-xs font-bold uppercase tracking-widest mt-2">Operational node is currently empty</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {notes.map(note => (
                    <StickyNote 
                      key={note._id} 
                      note={note} 
                      convertToTask={convertToTask}
                      updateNoteColor={updateNoteColor}
                      deleteNote={deleteNote}
                    />
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
