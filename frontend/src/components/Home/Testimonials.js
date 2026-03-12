import React from 'react';

const testimonials = [
  { id: 1, name: 'أحمد', rating: 5, comment: 'تجربة رائعة، السيارة نظيفة والسعر مناسب' },
  { id: 2, name: 'فاطمة', rating: 4, comment: 'خدمة ممتازة، سأكرر التجربة' },
  { id: 3, name: 'يوسف', rating: 5, comment: 'سهولة في الحجز وتعامل راقي' },
];

const Testimonials = () => (
  <div style={styles.section}>
    <h2 style={styles.title}>آراء المستخدمين</h2>
    <div style={styles.grid}>
      {testimonials.map(t => (
        <div key={t.id} style={styles.card}>
          <div style={styles.rating}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
          <p style={styles.comment}>"{t.comment}"</p>
          <p style={styles.name}>- {t.name}</p>
        </div>
      ))}
    </div>
  </div>
);

const styles = {
  section: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8f9fa' },
  title: { textAlign: 'center', fontSize: '28px', marginBottom: '30px', color: '#333' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  card: { border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: 'white' },
  rating: { color: '#ffc107', fontSize: '18px', marginBottom: '10px' },
  comment: { fontSize: '14px', color: '#555', lineHeight: '1.6', fontStyle: 'italic' },
  name: { fontWeight: 'bold', marginTop: '10px', color: '#333' },
};

export default Testimonials;