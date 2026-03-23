import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings');
      setSettings(data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Données par défaut en cas d'échec de connexion au serveur
      setSettings({
        // Informations de la plateforme
        platformName: 'DriveTunisia',
        platformLogo: '',
        platformFavicon: '',
        
        // Coordonnées de contact
        contactEmail: 'getcararoundtn@gmail.com', // ✅ conservé
        contactPhone: '+216 22 345 678',
        contactAddress: 'Sfax, Tunisie', // ✅ conservé
        
        // Réseaux sociaux
        facebook: 'https://facebook.com/drivetunisia',
        instagram: 'https://instagram.com/drivetunisia',
        twitter: 'https://twitter.com/drivetunisia',
        linkedin: 'https://linkedin.com/company/drivetunisia',
        
        // Commissions et frais
        commissionRate: 5,
        minCommission: 5,
        maxCommission: 50,
        
        // Paramètres de réservation
        maxBookingDays: 30,
        minRenterAge: 21,
        requireIdVerification: true,
        allowCompanyRentals: true,
        
        // Notifications
        emailNotifications: true,
        smsNotifications: false,
        adminEmailNotifications: true,
        
        // Textes du site
        termsAndConditions: 'Conditions générales d\'utilisation de DriveTunisia...',
        privacyPolicy: 'Politique de confidentialité de DriveTunisia...',
        aboutUs: 'DriveTunisia est une plateforme tunisienne de location de voitures entre particuliers et professionnels. Nous connectons les propriétaires de véhicules avec des locataires de confiance pour une expérience simple, sécurisée et sans intermédiaires.',
        
        // Paramètres de paiement
        paymentMethods: ['card', 'cash'],
        bankName: '',
        bankAccountNumber: '',
        bankIban: '',
        
        // Paramètres avancés
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};