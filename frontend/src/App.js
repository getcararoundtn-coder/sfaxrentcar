import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';

function App() {
  // للتأكد من تحميل الملف
  useEffect(() => {
    console.log('✅ App.js loaded successfully (isolated mode)');
    console.log('📝 Testing only /login route');
  }, []);

  return (
    <Router>
      <Routes>
        {/* فقط مسار /login للمعاينة */}
        <Route path="/login" element={<Login />} />
        
        {/* كل المسارات الأخرى تذهب إلى 404 */}
        <Route path="*" element={
          <div style={{ 
            padding: '50px', 
            textAlign: 'center',
            fontFamily: 'Arial',
            color: '#666'
          }}>
            <h1>404 - الصفحة غير موجودة</h1>
            <p>جاري اختبار المسارات...</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;