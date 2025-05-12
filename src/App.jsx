import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Members from "./pages/member/members";
import ChangePassword from "./components/ChangePassword";
import EditProfile from "./components/EditProfile";
import Sidebar from "./components/Navbar";
import ShopForm from "./pages/shop";

function Layout({ isOpen, setIsOpen }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-20"
        } bg-gradient-to-r from-indigo-50 to-purple-50 min-h-screen flex items-center justify-center`}
      >
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout isOpen={isOpen} setIsOpen={setIsOpen} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/members" element={<Members />} />
            <Route path="/myshop" element={<ShopForm />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
