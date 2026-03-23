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
          {/* Colonne 1 - Logo et description */}
          <div>
            <h4 style={styles.logo}>{settings?.platformName || 'DriveTunisia'}</h4>
            <p style={styles.description}>
              Plateforme de location de voitures entre particuliers et professionnels en Tunisie
            </p>
            <p style={styles.aboutText}>
              {settings?.aboutUs?.substring(0, 120) || 'DriveTunisia vous connecte avec des propriétaires de confiance pour une expérience de location simple, sécurisée et sans intermédiaires.'}
              {settings?.aboutUs?.length > 120 ? '...' : ''}
            </p>
          </div>
          
          {/* Colonne 2 - Liens rapides */}
          <div>
            <h4 style={styles.title}>Liens rapides</h4>
            <Link to="/" style={styles.link}>Accueil</Link>
            <Link to="/cars" style={styles.link}>Voitures</Link>
            <Link to="/terms" style={styles.link}>Conditions d'utilisation</Link>
            <Link to="/privacy" style={styles.link}>Politique de confidentialité</Link>
            <Link to="/about" style={styles.link}>À propos</Link>
          </div>
          
          {/* Colonne 3 - Contact et support */}
          <div>
            <h4 style={styles.title}>Contactez-nous</h4>
            <p style={styles.contactItem}>
              📧 <a href={`mailto:${settings?.contactEmail || 'contact@drivetunisia.com'}`} style={styles.emailLink}>
                {settings?.contactEmail || 'contact@drivetunisia.com'}
              </a>
            </p>
            <p style={styles.contactItem}>📞 {settings?.contactPhone || '+216 22 345 678'}</p>
            <p style={styles.contactItem}>📍 {settings?.contactAddress || 'Tunis, Tunisie'}</p>
            
            {/* Bouton support rapide */}
            <button onClick={() => setShowSupportModal(true)} style={styles.supportButton}>
              📩 Nous contacter
            </button>
            
            {/* Réseaux sociaux */}
            <div style={styles.socialLinks}>
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  Facebook
                </a>
              )}
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  Instagram
                </a>
              )}
              {settings?.twitter && (
                <a href={settings.twitter} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div style={styles.copyright}>
          © {new Date().getFullYear()} <strong>{settings?.platformName || 'DriveTunisia'}</strong>. Tous droits réservés.
          <br />
          <span style={styles.contactNote}>
            Location de voitures entre particuliers et professionnels en Tunisie
          </span>
        </div>
      </footer>

      {/* Modal support */}
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
    padding: '40px 20px 20px',
    marginTop: 'auto'
  },
  content: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '40px',
    marginBottom: '30px'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#6b46c0',
    marginBottom: '15px',
    letterSpacing: '-0.5px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#f7fafc',
    position: 'relative',
    display: 'inline-block'
  },
  description: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#cbd5e0',
    marginBottom: '12px'
  },
  aboutText: {
    fontSize: '13px',
    color: '#a0aec0',
    lineHeight: '1.5',
    marginTop: '10px'
  },
  link: { 
    display: 'block', 
    color: '#cbd5e0', 
    textDecoration: 'none', 
    marginBottom: '8px',
    fontSize: '14px',
    transition: 'color 0.2s ease'
  },
  linkHover: {
    color: '#6b46c0'
  },
  contactItem: {
    fontSize: '14px',
    color: '#cbd5e0',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  emailLink: {
    color: '#6b46c0',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s'
  },
  supportButton: {
    background: 'linear-gradient(135deg, #6b46c0 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    padding: '10px 20px',
    marginTop: '15px',
    marginBottom: '15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    width: '100%',
    maxWidth: '180px'
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
    marginTop: '15px',
    flexWrap: 'wrap'
  },
  socialLink: {
    color: '#cbd5e0',
    textDecoration: 'none',
    fontSize: '13px',
    padding: '6px 14px',
    backgroundColor: '#2d3748',
    borderRadius: '20px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#6b46c0',
      color: 'white'
    }
  },
  contactNote: {
    fontSize: '12px',
    color: '#718096',
    marginTop: '8px',
    display: 'block'
  },
  copyright: { 
    textAlign: 'center', 
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #2d3748',
    color: '#a0aec0', 
    fontSize: '13px',
    lineHeight: '1.5'
  },
};

// Ajout des styles hover (à mettre dans le CSS global ou via un fichier CSS)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .footer-link:hover {
    color: #6b46c0 !important;
  }
  .footer-email-link:hover {
    color: #8b5cf6 !important;
    text-decoration: underline !important;
  }
  .footer-support-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(107, 70, 192, 0.4);
  }
  .footer-social-link:hover {
    background-color: #6b46c0 !important;
    color: white !important;
  }
`;
document.head.appendChild(styleSheet);

export default Footer;