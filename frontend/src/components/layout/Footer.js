import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { SettingsContext } from '../../context/SettingsContext';

const Footer = () => {
  const { settings } = useContext(SettingsContext);

  return (
    <footer style={styles.footer}>
      <div style={styles.content}>
        <div>
          <h4>{settings?.platformName || 'SfaxRentCar'}</h4>
          <p>منصة تأجير السيارات بين الأفراد والشركات في تونس</p>
          <p style={styles.about}>{settings?.aboutUs?.substring(0, 100)}...</p>
        </div>
        
        <div>
          <h4>روابط سريعة</h4>
          <Link to="/" style={styles.link}>الرئيسية</Link>
          <Link to="/cars" style={styles.link}>السيارات</Link>
          <Link to="/terms" style={styles.link}>الشروط</Link>
          <Link to="/privacy" style={styles.link}>الخصوصية</Link>
          <Link to="/about" style={styles.link}>من نحن</Link>
        </div>
        
        <div>
          <h4>تواصل معنا</h4>
          <p>📧 <a href={`mailto:${settings?.contactEmail || 'getcararoundtn@gmail.com'}`} style={styles.emailLink}>
            {settings?.contactEmail || 'getcararoundtn@gmail.com'}
          </a></p>
          <p>📞 {settings?.contactPhone || '+216 12 345 678'}</p>
          <p>📍 {settings?.contactAddress || 'صفاقس، تونس'}</p>
          
          {/* روابط التواصل الاجتماعي */}
          <div style={styles.socialLinks}>
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                فيسبوك
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                انستغرام
              </a>
            )}
            {settings?.twitter && (
              <a href={settings.twitter} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                تويتر
              </a>
            )}
          </div>
        </div>
      </div>
      
      <div style={styles.copyright}>
        © {new Date().getFullYear()} {settings?.platformName || 'SfaxRentCar'}. جميع الحقوق محفوظة.
        <br />
        <span style={styles.contactNote}>للاستفسارات: <a href="mailto:getcararoundtn@gmail.com" style={styles.emailLink}>getcararoundtn@gmail.com</a></span>
      </div>
    </footer>
  );
};

const styles = {
  footer: { 
    backgroundColor: '#333', 
    color: 'white', 
    padding: '40px 20px 20px' 
  },
  content: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '30px' 
  },
  about: {
    fontSize: '14px',
    color: '#ccc',
    lineHeight: '1.6',
    marginTop: '10px'
  },
  link: { 
    display: 'block', 
    color: '#ccc', 
    textDecoration: 'none', 
    marginBottom: '5px',
    ':hover': {
      color: 'white'
    }
  },
  emailLink: {
    color: '#28a745',
    textDecoration: 'none',
    fontWeight: 'bold',
    ':hover': {
      textDecoration: 'underline',
      color: '#34ce57'
    }
  },
  socialLinks: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },
  socialLink: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '5px 10px',
    backgroundColor: '#444',
    borderRadius: '4px',
    ':hover': {
      backgroundColor: '#555',
      color: 'white'
    }
  },
  contactNote: {
    fontSize: '12px',
    color: '#aaa',
    marginTop: '10px',
    display: 'block'
  },
  copyright: { 
    textAlign: 'center', 
    marginTop: '30px', 
    color: '#aaa', 
    fontSize: '14px' 
  },
};

export default Footer;