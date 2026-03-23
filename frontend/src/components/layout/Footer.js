import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { SettingsContext } from '../../context/SettingsContext';
import ModalSupport from '../ModalSupport';

const Footer = () => {
  const { settings } = useContext(SettingsContext);
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <footer style={styles.footer}>
        <div style={styles.content}>
          <div>
            <h4>{settings?.platformName || 'DriveTunisia'}</h4>
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
            <p>📞 {settings?.contactPhone || '+216 22 345 678'}</p>
            <p>📍 {settings?.contactAddress || 'صفاقس، تونس'}</p>
            
            {/* ✅ زر الدعم السريع */}
            <button onClick={() => setShowSupportModal(true)} style={styles.supportButton}>
              📩 Contactez-nous
            </button>
            
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
          © {new Date().getFullYear()} {settings?.platformName || 'DriveTunisia'}. جميع الحقوق محفوظة.
          <br />
          <span style={styles.contactNote}>للاستفسارات: <a href="mailto:getcararoundtn@gmail.com" style={styles.emailLink}>getcararoundtn@gmail.com</a></span>
        </div>
      </footer>

      {/* Modal الدعم */}
      <ModalSupport 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />
    </>
  );
};

const styles = {
  footer: { 
    backgroundColor: '#1a202c', 
    color: '#e2e8f0', 
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
    color: '#cbd5e0',
    lineHeight: '1.6',
    marginTop: '10px'
  },
  link: { 
    display: 'block', 
    color: '#cbd5e0', 
    textDecoration: 'none', 
    marginBottom: '5px',
    transition: 'color 0.2s',
    ':hover': {
      color: '#ffffff'
    }
  },
  emailLink: {
    color: '#6b46c0',
    textDecoration: 'none',
    fontWeight: 'bold',
    ':hover': {
      textDecoration: 'underline',
      color: '#8b5cf6'
    }
  },
  supportButton: {
    background: '#6b46c0',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    padding: '10px 20px',
    marginTop: '15px',
    marginBottom: '15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.2s',
    width: '100%',
    maxWidth: '200px'
  },
  socialLinks: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },
  socialLink: {
    color: '#cbd5e0',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '5px 10px',
    backgroundColor: '#2d3748',
    borderRadius: '4px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#4a5568',
      color: 'white'
    }
  },
  contactNote: {
    fontSize: '12px',
    color: '#a0aec0',
    marginTop: '10px',
    display: 'block'
  },
  copyright: { 
    textAlign: 'center', 
    marginTop: '30px', 
    color: '#a0aec0', 
    fontSize: '14px' 
  },
};

export default Footer;