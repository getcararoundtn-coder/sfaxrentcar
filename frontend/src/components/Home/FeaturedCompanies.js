import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const FeaturedCompanies = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await API.get('/companies/featured');
        setCompanies(res.data.data);
      } catch (error) {
        setCompanies([
          { _id: 'c1', companyName: 'شركة الأمل', location: 'صفاقس', carsCount: 15 },
          { _id: 'c2', companyName: 'كار تونس', location: 'تونس', carsCount: 22 },
          { _id: 'c3', companyName: 'النجم الساطع', location: 'سوسة', carsCount: 8 },
        ]);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>شركات موثوقة</h2>
      <div style={styles.grid}>
        {companies.map(company => (
          <div key={company._id} style={styles.card}>
            <div style={styles.info}>
              <h3>{company.companyName}</h3>
              <p style={styles.location}>{company.location}</p>
              <p style={styles.carsCount}>{company.carsCount} سيارة</p>
              <Link to={`/company/${company._id}`} style={styles.button}>عرض السيارات</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8f9fa' },
  sectionTitle: { textAlign: 'center', fontSize: '28px', marginBottom: '30px', color: '#333' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  card: { border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: 'white', textAlign: 'center' },
  info: { display: 'flex', flexDirection: 'column', gap: '10px' },
  location: { color: '#666' },
  carsCount: { fontWeight: 'bold', color: '#28a745' },
  button: { display: 'inline-block', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', marginTop: '10px' },
};

export default FeaturedCompanies;