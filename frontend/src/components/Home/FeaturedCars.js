import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const FeaturedCars = () => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await API.get('/cars/featured');
        setCars(res.data.data);
      } catch (error) {
        // بيانات وهمية
        setCars([
          { _id: '1', brand: 'Renault', model: 'Clio', year: 2020, daily_price: 80, location: 'صفاقس', images: [] },
          { _id: '2', brand: 'Peugeot', model: '208', year: 2021, daily_price: 90, location: 'تونس', images: [] },
          { _id: '3', brand: 'Volkswagen', model: 'Golf', year: 2019, daily_price: 100, location: 'سوسة', images: [] },
        ]);
      }
    };
    fetchCars();
  }, []);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>سيارات مميزة</h2>
      <div style={styles.grid}>
        {cars.map(car => (
          <div key={car._id} style={styles.card}>
            <img src={car.images[0] || '/default-car.jpg'} alt={car.brand} style={styles.image} />
            <div style={styles.info}>
              <h3>{car.brand} {car.model} ({car.year})</h3>
              <p style={styles.price}>{car.daily_price} دينار/يوم</p>
              <p style={styles.location}>{car.location}</p>
              <Link to={`/car/${car._id}`} style={styles.button}>عرض التفاصيل</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: { textAlign: 'center', fontSize: '28px', marginBottom: '30px', color: '#333' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' },
  image: { width: '100%', height: '180px', objectFit: 'cover' },
  info: { padding: '15px' },
  price: { fontSize: '18px', fontWeight: 'bold', color: '#28a745', margin: '5px 0' },
  location: { color: '#666', marginBottom: '10px' },
  button: { display: 'inline-block', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' },
};

export default FeaturedCars;