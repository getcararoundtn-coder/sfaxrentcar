import React from 'react';

const steps = [
  { icon: '🔍', title: 'اختر سيارتك', desc: 'تصفح السيارات المتاحة واختر ما يناسبك' },
  { icon: '📅', title: 'احجز التواريخ', desc: 'حدد تاريخ البداية والنهاية للحجز' },
  { icon: '📄', title: 'أضف بياناتك', desc: 'ارفع بطاقة التعريف ورخصة السياقة' },
  { icon: '🚗', title: 'استلم السيارة', desc: 'استلم السيارة واستمتع برحلتك' },
];

const HowItWorks = () => (
  <div style={styles.section}>
    <h2 style={styles.title}>كيف يعمل الموقع</h2>
    <div style={styles.steps}>
      {steps.map((step, i) => (
        <div key={i} style={styles.step}>
          <span style={styles.icon}>{step.icon}</span>
          <h3 style={styles.stepTitle}>{step.title}</h3>
          <p style={styles.stepDesc}>{step.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const styles = {
  section: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
  title: { textAlign: 'center', fontSize: '28px', marginBottom: '30px', color: '#333' },
  steps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  step: { textAlign: 'center' },
  icon: { fontSize: '48px', display: 'block', marginBottom: '10px' },
  stepTitle: { fontSize: '20px', marginBottom: '5px' },
  stepDesc: { color: '#666' },
};

export default HowItWorks;