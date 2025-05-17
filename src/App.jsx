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
import ProductPage from "./pages/products/index";
import ProductForm from "./pages/products/productForm";
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
              path="/shopmanage/:shopId/product"
              element={
                <ProtectedRoute>
                  <ProductPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shopmanage/:shopId/addproduct"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shopmanage/:shopId/:productId/editproduct"
              element={
                <ProtectedRoute>
                  <ProductForm action="edit" />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">404 - Not Found</h1>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
