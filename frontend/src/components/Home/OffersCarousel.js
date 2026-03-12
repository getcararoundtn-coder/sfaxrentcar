import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { styles } from '../../styles/homeStyles';

const OffersCarousel = () => {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await API.get('/offers');
        setOffers(response.data.data);
      } catch (error) {
        console.error('Error fetching offers:', error);
        // بيانات وهمية
        setOffers([
          { _id: 'o1', car: { brand: 'Renault', model: 'Clio', daily_price: 80, images: [] }, discount: 20, newPrice: 64 },
          { _id: 'o2', car: { brand: 'Peugeot', model: '208', daily_price: 90, images: [] }, discount: 15, newPrice: 76.5 },
        ]);
      }
    };
    fetchOffers();
  }, []);

  if (offers.length === 0) return null;

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>عروض مميزة</h2>
      <div style={styles.grid}>
        {offers.map(offer => (
          <div key={offer._id} style={styles.offerCard}>
            <span style={styles.offerBadge}>-{offer.discount}%</span>
            <img src={offer.car.images?.[0] || '/default-car.jpg'} alt={offer.car.brand} style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{offer.car.brand} {offer.car.model}</h3>
              <p>
                <span style={styles.cardPrice}>{offer.newPrice} دينار</span>
                <span style={styles.oldPrice}>{offer.car.daily_price} دينار</span>
              </p>
              <Link to={`/car/${offer.car._id}`} style={styles.button}>احجز الآن</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersCarousel;