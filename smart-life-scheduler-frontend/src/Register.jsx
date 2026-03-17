import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import { User, Mail, Lock, Github, CheckCircle2, Phone } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", phno: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");

    // Check for GitHub OAuth code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    
    if (code) {
      // Clear code from URL
      window.history.replaceState({}, document.title, "/register");
      handleGithubRegister(code);
    }
  }, [navigate]);

  const handleGithubRegister = async (code) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/github", { code });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) setError("Network error: Please ensure the backend server is running.");
      else if (err.response?.data?.errors) setError(err.response.data.errors.join(", "));
      else setError(err.response?.data?.message || "GitHub Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      const loginRes = await api.post("/auth/login", { email: formData.email, password: formData.password });
      localStorage.setItem("token", loginRes.data.token);
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) {
        setError("Network error: The backend server might be starting up. Please wait 30 seconds and try again.");
      } else if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(", "));
      } else {
        setError(err.response?.data?.message || "Registration Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    if (provider === "GitHub") {
      window.location.href = "https://github.com/login/oauth/authorize?client_id=Ov23liCRvpsWvmnJTeVp&scope=user:email&prompt=consent";
    } else {
      setError(`${provider} registration will be available soon!`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-5xl animate-slideUpFade bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
         
         {/* Left Col: Auth Form */}
         <div className="w-full md:w-1/2 p-8 sm:p-12 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 text-center md:text-left mb-8">
               <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Create Account</h2>
               <p className="text-indigo-200 mt-2 text-[15px] font-medium tracking-wide">Join Smart Life Scheduler today</p>
            </div>

            {error && (
               <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-2xl mb-6 text-sm text-center font-medium shadow-inner">
                  {error}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="h-5 w-5 text-indigo-300 drop-shadow-sm" />
                  </div>
                  <input
                     type="text"
                     name="name"
                     placeholder="Full Name"
                     value={formData.name}
                     onChange={handleChange}
                     className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium text-[15px] shadow-inner"
                     required
                     disabled={loading}
                  />
               </div>

               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Mail className="h-5 w-5 text-indigo-300 drop-shadow-sm" />
                  </div>
                  <input
                     type="email"
                     name="email"
                     placeholder="Email address"
                     value={formData.email}
                     onChange={handleChange}
                     className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium text-[15px] shadow-inner"
                     required
                     disabled={loading}
                  />
               </div>

               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-5 w-5 text-indigo-300 drop-shadow-sm" />
                  </div>
                  <input
                     type="password"
                     name="password"
                     placeholder="Password"
                     value={formData.password}
                     onChange={handleChange}
                     className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium text-[15px] shadow-inner"
                     required
                     disabled={loading}
                  />
               </div>

               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Phone className="h-5 w-5 text-indigo-300 drop-shadow-sm" />
                  </div>
                  <input
                     type="tel"
                     name="phno"
                     placeholder="Phone Number (e.g. 1234567890)"
                     value={formData.phno}
                     onChange={handleChange}
                     className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium text-[15px] shadow-inner"
                     required
                     disabled={loading}
                  />
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-2 py-3.5 rounded-2xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 tracking-wide text-[16px] ${
                  loading ? "bg-gray-500/50 cursor-not-allowed opacity-70" : "bg-gradient-to-r from-indigo-600 to-cyan-500 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] active:scale-[0.98]"}`}
               >
                  {loading ? "Registering..." : "Create Account"}
               </button>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center justify-center space-x-4 relative z-10">
               <div className="h-px bg-white/10 w-full"></div>
               <span className="text-gray-400 text-sm font-medium shrink-0">Or continue with</span>
               <div className="h-px bg-white/10 w-full"></div>
            </div>

            {/* Social Logins */}
            <div className="mt-6 flex justify-center relative z-10">
               <button onClick={() => handleSocialRegister("GitHub")} type="button" className="flex items-center justify-center space-x-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Github className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-semibold tracking-wide">Continue with GitHub</span>
               </button>
            </div>

            <p className="text-center md:text-left text-[14px] mt-8 text-gray-400 font-medium relative z-10">
               Already have an account?{" "}
               <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold tracking-wide underline decoration-cyan-400/30 underline-offset-4">
                  Log in
               </Link>
            </p>
         </div>

         {/* Right Col: Illustration */}
         <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600/20 to-cyan-500/20 p-12 items-center justify-center relative border-l border-white/5">
            <div className="absolute inset-0 bg-black/20 decoration-squares"></div>
            
            {/* Abstract Calendar/Task Illustration */}
            <div className="relative z-10 w-full max-w-sm aspect-square bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 flex flex-col justify-between transform transition-transform hover:scale-105 duration-500 group">
               {/* Top Bar */}
               <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-2">
                     <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                     <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white/80">Today</div>
               </div>

               {/* Mock Tasks */}
               <div className="space-y-4">
                  {[
                    { title: "Review product roadmap", width: "w-3/4", color: "bg-indigo-400" },
                    { title: "Team sync meeting", width: "w-full", color: "bg-teal-400" },
                    { title: "Design system update", width: "w-5/6", color: "bg-purple-400" }
                  ].map((mockTask, i) => (
                     <div key={i} className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                        <CheckCircle2 className={`w-5 h-5 ${mockTask.color} rounded-full text-slate-900 border-none shadow-lg`} />
                        <div className="flex-1">
                           <div className={`h-2 ${mockTask.width} ${mockTask.color} rounded opacity-80 mb-2`}></div>
                           <div className="h-1.5 w-1/3 bg-white/20 rounded"></div>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Floating Decoration */}
               <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-full blur-[20px] opacity-50 animate-pulse"></div>
               <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full blur-[20px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
         </div>

      </div>
    </div>
  );
}

export default Register;
