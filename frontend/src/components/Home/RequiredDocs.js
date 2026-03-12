import React from 'react';
import { Link } from 'react-router-dom';

const RequiredDocs = ({ user }) => (
  <div style={styles.section}>
    <h2 style={styles.title}>الوثائق المطلوبة</h2>
    <div style={styles.grid}>
      <div style={styles.card}>
        <h3>👤 للأفراد</h3>
        <ul style={styles.list}>
          <li>✅ بطاقة تعريف سارية</li>
          <li>✅ رخصة قيادة سارية</li>
        </ul>
        {user && <Link to="/upload-docs" style={styles.button}>رفع الوثائق</Link>}
      </div>
      <div style={styles.card}>
        <h3>🏢 للشركات</h3>
        <ul style={styles.list}>
          <li>✅ رخصة الشركة (السجل التجاري)</li>
          <li>✅ أوراق الممثل القانوني</li>
        </ul>
        {user && <Link to="/upload-docs" style={styles.button}>رفع الوثائق</Link>}
      </div>
    </div>
  </div>
);

const styles = {
  section: { padding: '40px 20px', maxWidth: '800px', margin: '0 auto' },
  title: { textAlign: 'center', fontSize: '28px', marginBottom: '30px', color: '#333' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card: { border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' },
  list: { listStyle: 'none', padding: 0, marginBottom: '15px' },
  button: { display: 'inline-block', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' },
};

export default RequiredDocs;