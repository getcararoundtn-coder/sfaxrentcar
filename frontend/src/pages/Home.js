import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './Home.css';

// Toutes les wilayas tunisiennes (24)
const wilayasData = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
  'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse',
  'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
  'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'
];

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) {
      params.append('city', selectedCity);
    }
    navigate(`/cars?${params.toString()}`);
  };

  const handleCarTypeClick = (type) => {
    navigate(`/cars?type=${type}`);
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section avec image de fond */}
      <div 
        className="hero-section" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${process.env.PUBLIC_URL}/images/hero.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">
            Louez votre voiture facilement en Tunisie, en toute sécurité et sans intermédiaires
          </h1>
          <p className="hero-subtitle">
            Choisissez votre véhicule parmi des propriétaires de confiance dans votre région et commencez votre voyage aujourd'hui
          </p>
          
          {/* Trust Signals */}
          <div className="trust-signals">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span className="trust-text">Paiement sécurisé</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⭐</span>
              <span className="trust-text">Avis vérifiés</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🕒</span>
              <span className="trust-text">Support 24/7</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">📋</span>
              <span className="trust-text">Documents sécurisés</span>
            </div>
          </div>
          
          <Link to="/cars" className="hero-cta-button">
            Découvrir les voitures
          </Link>
        </div>
      </div>

      {/* Search Hero - Simplifié */}
      <div className="search-hero">
        <div className="search-container">
          <h2 className="search-title">
            Location de voitures entre particuliers et professionnels en Tunisie
          </h2>
          
          <form onSubmit={handleSearch} className="search-form-simplified">
            <div className="search-field">
              <input
                type="text"
                placeholder="Où souhaitez-vous louer ? (ex: Tunis, Sfax, Sousse...)"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                list="wilayas-list"
                className="search-input"
              />
              <datalist id="wilayas-list">
                {wilayasData.map(w => <option key={w} value={w} />)}
              </datalist>
            </div>
            
            <button type="submit" className="search-button">
              Rechercher
            </button>
          </form>
          
          <p className="search-note">
            DriveTunisia - Location de voitures entre particuliers et professionnels en Tunisie
          </p>
          <p className="search-hint">
            💡 Utilisez les filtres avancés sur la page des résultats pour affiner votre recherche
          </p>
        </div>
      </div>

      {/* Car Types */}
      <div className="car-types">
        <h2 className="section-title">Choisissez selon vos besoins</h2>
        <div className="types-grid">
          <button onClick={() => handleCarTypeClick('Citadine')} className="type-card">Citadine</button>
          <button onClick={() => handleCarTypeClick('Utilitaire')} className="type-card">Utilitaire</button>
          <button onClick={() => handleCarTypeClick('SUV')} className="type-card">SUV</button>
          <button onClick={() => handleCarTypeClick('Familiale')} className="type-card">Familiale</button>
          <button onClick={() => handleCarTypeClick('Luxe')} className="type-card">Luxe</button>
          <button onClick={() => handleCarTypeClick('Économique')} className="type-card">Économique</button>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h2 className="section-title">Comment ça marche ?</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-icon">1️⃣</div>
            <h3 className="step-title">Trouvez une voiture près de chez vous</h3>
            <p className="step-desc">Choisissez parmi des centaines de véhicules disponibles</p>
          </div>
          <div className="step">
            <div className="step-icon">2️⃣</div>
            <h3 className="step-title">Réservez en quelques clics</h3>
            <p className="step-desc">Choisissez vos dates et finalisez votre réservation</p>
          </div>
          <div className="step">
            <div className="step-icon">3️⃣</div>
            <h3 className="step-title">Récupérez la voiture</h3>
            <p className="step-desc">Rencontrez le propriétaire et partez à l'aventure</p>
          </div>
        </div>
      </div>

      {/* Rent Section */}
      <div className="rent-section">
        <div className="rent-content">
          <h2 className="rent-title">Vous voulez louer votre voiture ?</h2>
          <Link to={user ? "/rent-your-car" : "/register"} className="rent-button">
            Louer ma voiture
          </Link>
        </div>
      </div>

      {/* Wilayas Section */}
      <div className="wilayas-section">
        <h2 className="section-title">Louer une voiture en Tunisie</h2>
        <div className="wilayas-grid">
          {wilayasData.map(wilaya => (
            <button
              key={wilaya}
              onClick={() => {
                const params = new URLSearchParams();
                params.append('city', wilaya);
                navigate(`/cars?${params.toString()}`);
              }}
              className="wilaya-card"
            >
              {wilaya}
            </button>
          ))}
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Home;