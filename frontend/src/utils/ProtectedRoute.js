import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, authChecked } = useContext(AuthContext);

  // ✅ انتظار انتهاء التحقق من المصادقة
  if (loading || !authChecked) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // ✅ إذا لم يكن المستخدم مسجلاً
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ إذا كان هناك دور مطلوب ولم يتطابق
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'sans-serif'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #6b46c0',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  }
};

// إضافة animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProtectedRoute;