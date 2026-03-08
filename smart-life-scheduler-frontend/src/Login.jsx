import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Github, CheckCircle2, Phone } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
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
      window.history.replaceState({}, document.title, "/login");
      handleGithubLogin(code);
    }
  }, [navigate]);

  const handleGithubLogin = async (code) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/github", { code });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "GitHub Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/phone", { phno: phone });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Phone login failed. Have you added it to your profile?");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === "GitHub") {
      window.location.href = "https://github.com/login/oauth/authorize?client_id=Ov23liCRvpsWvmnJTeVp&scope=user:email";
    } else {
      setError(`${provider} login will be available soon!`);
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
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Welcome Back</h2>
            <p className="text-indigo-200 mt-2 text-[15px] font-medium tracking-wide">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-2xl mb-6 text-sm text-center font-medium shadow-inner">
              {error}
            </div>
          )}

          {isPhoneLogin ? (
          <form onSubmit={handlePhoneLogin} className="space-y-5 relative z-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-indigo-300 drop-shadow-sm" />
              </div>
              <input
                type="tel"
                placeholder="Enter Phone Number (e.g. 1234567890)"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium text-[15px] shadow-inner"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 tracking-wide text-[16px] ${
              loading ? "bg-gray-500/50 cursor-not-allowed opacity-70" : "bg-gradient-to-r from-indigo-600 to-cyan-500 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] active:scale-[0.98]"}`}
            >
              {loading ? "Authenticating..." : "Sign In with Phone"}
            </button>
          </form>
          ) : (
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-indigo-300 drop-shadow-sm" />
              </div>
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium text-[15px] shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-indigo-300 drop-shadow-sm" />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium text-[15px] shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 tracking-wide text-[16px] ${
              loading ? "bg-gray-500/50 cursor-not-allowed opacity-70" : "bg-gradient-to-r from-indigo-600 to-cyan-500 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] active:scale-[0.98]"}`}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
          )}

          {/* Divider */}
          <div className="mt-8 flex items-center justify-center space-x-4 relative z-10">
            <div className="h-px bg-white/10 w-full"></div>
            <span className="text-gray-400 text-sm font-medium shrink-0">Or continue with</span>
            <div className="h-px bg-white/10 w-full"></div>
          </div>

          {/* Social Logins */}
          <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
            <button onClick={() => setIsPhoneLogin(!isPhoneLogin)} type="button" className={`flex items-center justify-center space-x-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95 ${isPhoneLogin ? "ring-2 ring-indigo-500/50 bg-white/10" : ""}`}>
              {isPhoneLogin ? <Mail className="w-5 h-5 text-indigo-400" /> : <Phone className="w-5 h-5 text-indigo-400" />}
              <span className="text-white text-sm font-semibold tracking-wide">{isPhoneLogin ? "Email Login" : "Phone Login"}</span>
            </button>
            <button onClick={() => handleSocialLogin("GitHub")} type="button" className="flex items-center justify-center space-x-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95">
              <Github className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold tracking-wide">GitHub</span>
            </button>
          </div>

          <p className="text-center md:text-left text-[14px] mt-8 text-gray-400 font-medium relative z-10">
            Don't have an account?{" "}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold tracking-wide underline decoration-cyan-400/30 underline-offset-4">
              Create one
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

export default Login;
