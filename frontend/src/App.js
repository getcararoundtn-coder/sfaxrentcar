import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import AddCar from './pages/AddCar';
import RentYourCar from './pages/RentYourCar'; // ✅ إضافة استيراد الصفحة الجديدة
import CarDetails from './pages/CarDetails';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import OwnerCars from './pages/OwnerCars';
import Messages from './pages/Messages';
import Cars from './pages/Cars';
import NotFound from './pages/NotFound';
import ProtectedRoute from './utils/ProtectedRoute';
import CookieConsentBanner from './components/CookieConsent';

function App() {
  // للتأكد من تحميل الملف
  useEffect(() => {
    console.log('✅ App.js loaded successfully (full version)');
    console.log('📝 Available routes:', [
      '/', '/forgot-password', '/reset-password/:token', '/terms', '/privacy', 
      '/about', '/cars', '/car/:id', '/profile', '/my-bookings', '/owner-cars', 
      '/add-car', '/rent-your-car', '/booking/:carId', '/messages/:bookingId', '/admin'
    ]);
  }, []);

  return (
    <Router>
      <Routes>
        {/* ========== المسارات العامة ========== */}
        <Route path="/" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car/:id" element={<CarDetails />} />

        {/* ========== صفحة إضافة السيارة (Wizard) ========== */}
        <Route path="/rent-your-car" element={
          <ProtectedRoute>
            <RentYourCar />
          </ProtectedRoute>
        } />

        {/* ========== المسارات المحمية (تتطلب تسجيل دخول) ========== */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/owner-cars" element={
          <ProtectedRoute>
            <OwnerCars />
          </ProtectedRoute>
        } />
        <Route path="/add-car" element={
          <ProtectedRoute>
            <AddCar />
          </ProtectedRoute>
        } />
        <Route path="/booking/:carId" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } />
        <Route path="/messages/:bookingId" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        {/* ========== مسارات المشرف (تتطلب دور admin) ========== */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* ========== صفحة 404 للمسارات غير الموجودة ========== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* شريط الموافقة على الكوكيز */}
      <CookieConsentBanner />
    </Router>
  );
}

export default App;