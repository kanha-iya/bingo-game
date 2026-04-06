import { Routes, Route } from "react-router-dom";

// import PlayMatch from "@/pages/game/PlayMatch";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/dashboard/Dashboard";
import ProtectedRoute from "@/components/common/ProtectedRoutes";
import PlayMatch from "@/pages/games/PlayMatch";
import Subscription from "@/pages/subscription/Subscription";
import MatchLobby from "@/pages/games/MatchLobby";

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/play"
        element={
          <ProtectedRoute>
            <PlayMatch />
          </ProtectedRoute>
        }
      />
      <Route
  path="/lobby/:gameId"
  element={
    <ProtectedRoute>
      <MatchLobby />
    </ProtectedRoute>
  }
/>
<Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />
<Route path="*" element={<Login />} />
    </Routes>

  );
};

export default AppRoutes;