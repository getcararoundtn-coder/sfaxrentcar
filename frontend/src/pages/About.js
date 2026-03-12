import React, { useContext } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { SettingsContext } from '../context/SettingsContext';

const About = () => {
  const { settings, loading } = useContext(SettingsContext);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>جاري التحميل...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>من نحن</h1>
        
        <div style={styles.content}>
          {/* عرض نص "من نحن" من الإعدادات */}
          {settings?.aboutUs ? (
            <div style={styles.aboutText}>
              {settings.aboutUs.split('\n').map((paragraph, index) => (
                <p key={index} style={styles.paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p style={styles.paragraph}>
              {settings?.platformName || 'SfaxRentCar'} هي منصة تونسية لكراء السيارات بين الأفراد والشركات. 
              نهدف إلى تسهيل عملية تأجير السيارات وجعلها أكثر أماناً وشفافية للجميع.
            </p>
          )}

          {/* معلومات الاتصال */}
          <div style={styles.contactSection}>
            <h3 style={styles.subtitle}>معلومات الاتصال</h3>
            
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📧</span>
              <div>
                <strong>البريد الإلكتروني:</strong>{' '}
                <a href={`mailto:${settings?.contactEmail || 'getcararoundtn@gmail.com'}`} style={styles.emailLink}>
                  {settings?.contactEmail || 'getcararoundtn@gmail.com'}
                </a>
              </div>
            </div>

            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📞</span>
              <div>
                <strong>الهاتف:</strong> {settings?.contactPhone || '+216 12 345 678'}
              </div>
            </div>

            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📍</span>
              <div>
                <strong>العنوان:</strong> {settings?.contactAddress || 'صفاقس، تونس'}
              </div>
            </div>

            {/* روابط التواصل الاجتماعي */}
            {(settings?.facebook || settings?.instagram || settings?.twitter || settings?.linkedin) && (
              <div style={styles.socialSection}>
                <h4 style={styles.socialTitle}>تابعنا على</h4>
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
                  {settings?.linkedin && (
                    <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                      لينكد إن
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* إحصائيات سريعة (اختياري) */}
          <div style={styles.statsSection}>
            <h3 style={styles.subtitle}>إحصائيات سريعة</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>+500</span>
                <span style={styles.statLabel}>سيارة</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>+2000</span>
                <span style={styles.statLabel}>مستخدم</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>+100</span>
                <span style={styles.statLabel}>شركة</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>+1000</span>
                <span style={styles.statLabel}>حجز</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const styles = {
  container: { 
    maxWidth: '900px', 
    margin: '40px auto', 
    padding: '0 20px' 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: '30px', 
    color: '#333',
    fontSize: '32px',
    fontWeight: 'bold'
  },
  content: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  aboutText: {
    lineHeight: '1.8',
    color: '#555',
    marginBottom: '30px',
    fontSize: '16px',
  },
  paragraph: {
    marginBottom: '15px',
  },
  contactSection: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  subtitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
    fontSize: '22px',
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  contactIcon: {
    fontSize: '24px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '50%',
  },
  emailLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  socialSection: {
    marginTop: '20px',
    textAlign: 'center',
  },
  socialTitle: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '10px',
  },
  socialLinks: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  socialLink: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#0056b3',
    },
  },
  statsSection: {
    marginTop: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
  },
  statNumber: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666'
  }
};

export default About;