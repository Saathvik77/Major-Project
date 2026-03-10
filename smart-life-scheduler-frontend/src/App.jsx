import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import PrivateRoute from "./PrivateRoute";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Health from "./pages/Health";
import { ThemeProvider } from "./ThemeContext";
import AnimatedBackground from "./components/AnimatedBackground";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AnimatedBackground />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Tasks */}
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            }
          />

          {/* ✅ Analytics Route Added */}
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />

          {/* Health */}
          <Route
            path="/health"
            element={
              <PrivateRoute>
                <Health />
              </PrivateRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
