import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';

// Route-level code splitting keeps the initial bundle small; heavy
// dependencies (recharts, react-quill) load only when their page is visited.
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Checkout = lazy(() => import('./pages/Checkout'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const ChatPage = lazy(() => import('./pages/Chat'));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
    <i className="fas fa-spinner fa-spin text-2xl text-emerald-500"></i>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageFallback />}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/chat" element={<ChatPage />} />
        
        <Route 
          path="/seller" 
          element={
            <ProtectedRoute allowedRoles={['farmer', 'seller']}>
              <SellerDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/farmer" 
          element={
            <ProtectedRoute allowedRoles={['farmer', 'seller']}>
              <SellerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/buyer" 
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        </Routes>
      </Suspense>
      <Chatbot />
    </Router>
  );
}

export default App