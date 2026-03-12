import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.content}>
      <div>
        <h4>SfaxRentCar</h4>
        <p>منصة تأجير السيارات بين الأفراد والشركات في تونس</p>
      </div>
      <div>
        <h4>روابط سريعة</h4>
        <Link to="/" style={styles.link}>الرئيسية</Link>
        <Link to="/cars" style={styles.link}>السيارات</Link>
        <Link to="/companies" style={styles.link}>الشركات</Link>
        <Link to="/terms" style={styles.link}>الشروط</Link>
        <Link to="/privacy" style={styles.link}>الخصوصية</Link>
      </div>
      <div>
        <h4>تواصل معنا</h4>
        <p>support@sfaxrentcar.com</p>
        <p>+216 12 345 678</p>
      </div>
    </div>
    <div style={styles.copyright}>© 2026 SfaxRentCar. جميع الحقوق محفوظة.</div>
  </footer>
);

const styles = {
  footer: { backgroundColor: '#333', color: 'white', padding: '40px 20px 20px' },
  content: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' },
  link: { display: 'block', color: '#ccc', textDecoration: 'none', marginBottom: '5px' },
  copyright: { textAlign: 'center', marginTop: '30px', color: '#aaa', fontSize: '14px' },
};

export default Footer;