import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import UploadDocuments from './pages/UploadDocuments';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import AddCar from './pages/AddCar';
import CarDetails from './pages/CarDetails';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import OwnerCars from './pages/OwnerCars';
import Messages from './pages/Messages';
import Cars from './pages/Cars';
import NotFound from './pages/NotFound';
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* المسارات العامة */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car/:id" element={<CarDetails />} />

        {/* المسارات المحمية (تتطلب تسجيل دخول) */}
        <Route path="/upload-docs" element={
          <ProtectedRoute>
            <UploadDocuments />
          </ProtectedRoute>
        } />
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

        {/* مسارات المشرف (تتطلب دور admin) */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* صفحة 404 للمسارات غير الموجودة */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;