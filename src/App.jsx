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
import ShopPage from "./pages/shop";
import ShopForm from "./pages/shop/shopForm";
import ShopManage from "./pages/shop/ShopManage";
import EmployeeList from "./pages/shop/EmployeeList";
import EmployeeForm from "./pages/shop/EmployeeForm";
import ProtectedRoute from "./components/ProtectedRoute";

function Layout({ isOpen, setIsOpen }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-20"
        } bg-gradient-to-r from-indigo-50 to-purple-50 min-h-screen`}
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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path="/myshop"
              element={
                <ProtectedRoute>
                  <ShopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopcreate"
              element={
                <ProtectedRoute>
                  <ShopForm action="create" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopedit/:id"
              element={
                <ProtectedRoute>
                  <ShopForm action="edit" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopmanage/:shopId"
              element={
                <ProtectedRoute>
                  <ShopManage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/:shopId/employees"
              element={
                <ProtectedRoute>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/:shopId/employees/new"
              element={
                <ProtectedRoute>
                  <EmployeeForm action="create" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/:shopId/employees/:id/edit"
              element={
                <ProtectedRoute>
                  <EmployeeForm action="edit" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopmanage/:shopId/addproduct"
              element={
                <ProtectedRoute>
                  <div className="p-6 text-center text-gray-600">
                    หน้าเพิ่มสินค้า (ยังไม่พัฒนา)
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;