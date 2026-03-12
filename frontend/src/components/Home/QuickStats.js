import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const QuickStats = () => {
  const [stats, setStats] = useState({ cars: 0, users: 0, companies: 0, bookings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/stats');
        setStats(res.data.data);
      } catch (error) {
        // بيانات وهمية
        setStats({ cars: 150, users: 1200, companies: 25, bookings: 340 });
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={styles.statsContainer}>
      <div style={styles.statCard}>
        <span style={styles.statNumber}>{stats.cars}</span>
        <span style={styles.statLabel}>سيارة</span>
      </div>
      <div style={styles.statCard}>
        <span style={styles.statNumber}>{stats.users}</span>
        <span style={styles.statLabel}>مستخدم</span>
      </div>
      <div style={styles.statCard}>
        <span style={styles.statNumber}>{stats.companies}</span>
        <span style={styles.statLabel}>شركة</span>
      </div>
      <div style={styles.statCard}>
        <span style={styles.statNumber}>{stats.bookings}</span>
        <span style={styles.statLabel}>حجز</span>
      </div>
    </div>
  );
};

const styles = {
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    padding: '40px 20px',
    backgroundColor: '#f8f9fa',
  },
  statCard: {
    textAlign: 'center',
    minWidth: '120px',
    margin: '10px',
  },
  statNumber: {
    display: 'block',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: '16px',
    color: '#666',
  },
};

export default QuickStats;