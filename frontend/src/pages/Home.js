import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './Home.css';

// جميع الولايات التونسية الـ 24
const wilayasData = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
  'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse',
  'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
  'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'
];

// المعتمديات لكل ولاية
const delegationsData = {
  'Tunis': ['Tunis Centre', 'El Menzah', 'Le Bardo', 'La Marsa', 'Carthage', 'Sidi Hassine', 'El Omrane', 'Ettahrir', 'Bab El Bhar'],
  'Ariana': ['Ariana Ville', 'Raoued', 'Soukra', 'Kalâat El Andalous', 'Sidi Thabet', 'Ettadhamen', 'Mnihla'],
  'Ben Arous': ['Ben Arous', 'Bou Mhel', 'El Mourouj', 'Hammam Lif', 'Hammam Chott', 'Mégrine', 'Mornag', 'Radès', 'Fouchana', 'Mohamedia'],
  'Manouba': ['Manouba', 'Djedeida', 'Douar Hicher', 'Mornaguia', 'Borj El Amri', 'Oued Ellil'],
  'Nabeul': ['Nabeul', 'Hammamet', 'Kélibia', 'Dar Chaabane', 'Beni Khiar', 'Korba', 'Menzel Temime', 'Takelsa', 'Soliman', 'Grombalia', 'Bou Argoub', 'El Haouaria'],
  'Zaghouan': ['Zaghouan', 'Fahs', 'Bir Mcherga', 'Zriba', 'El Fahs', 'Saouaf'],
  'Bizerte': ['Bizerte Nord', 'Bizerte Sud', 'Menzel Bourguiba', 'Menzel Jemil', 'Ras Jebel', 'Ghezala', 'Tinja', 'Sejnane', 'Joumine', 'Utique'],
  'Béja': ['Béja Nord', 'Béja Sud', 'Amdoun', 'Goubellat', 'Nefza', 'Téboursouk', 'Testour'],
  'Jendouba': ['Jendouba Nord', 'Jendouba Sud', 'Tabarka', 'Aïn Draham', 'Fernana', 'Bousalem', 'Ghardimaou', 'Oued Meliz'],
  'Le Kef': ['Le Kef Est', 'Le Kef Ouest', 'Dahmani', 'Sakiet Sidi Youssef', 'Tajerouine', 'Kalaat Senan', 'Kalaa Khasba', 'Jerissa'],
  'Siliana': ['Siliana Nord', 'Siliana Sud', 'Gaâfour', 'Bou Arada', 'El Krib', 'Makthar', 'Rohia', 'Kesra'],
  'Sousse': ['Sousse Ville', 'Sousse Jawhara', 'Sousse Riadh', 'Hammam Sousse', 'Msaken', 'Kalâa Kebira', 'Kalâa Seghira', 'Sidi Bou Ali', 'Enfidha', 'Bouficha'],
  'Monastir': ['Monastir', 'Jemmal', 'Moknine', 'Bekalta', 'Ksar Hellal', 'Bembla', 'Zeramdine', 'Sahline', 'Ouerdanine', 'Sayada', 'Téboulba'],
  'Mahdia': ['Mahdia', 'Chebba', 'Ksour Essaf', 'Souassi', 'Mellouleche', 'Bou Merdes', 'El Jem', 'Hebira', 'Ouled Chamekh'],
  'Sfax': ['Sfax Ville', 'Sakiet Ezzit', 'Sakiet Eddaier', 'El Ain', 'Bir Ali Ben Khalifa', 'Agareb', 'Ghraiba', 'Mahrès', 'Menzel Chaker', 'Skhira', 'Thyna', 'Jebiniana'],
  'Kairouan': ['Kairouan Nord', 'Kairouan Sud', 'Hajeb El Ayoun', 'Sbikha', 'Oueslatia', 'Bou Hajla', 'Chebika', 'Nasrallah', 'El Ala', 'Menzel Mehiri'],
  'Kasserine': ['Kasserine Nord', 'Kasserine Sud', 'Sbeitla', 'Feriana', 'Foussana', 'Thala', 'Majel Bel Abbes', 'Hassi El Ferid', 'Jedeliane'],
  'Sidi Bouzid': ['Sidi Bouzid Est', 'Sidi Bouzid Ouest', 'Meknassy', 'Menzel Bouzaiane', 'Regueb', 'Jilma', 'Souk Jedid', 'Ouled Haffouz'],
  'Gabès': ['Gabès Ville', 'Gabès Médina', 'Gabès Ouest', 'Mareth', 'Métouia', 'El Hamma', 'Matmata', 'Menzel Habib'],
  'Médenine': ['Médenine Nord', 'Médenine Sud', 'Ben Gardane', 'Zarzis', 'Djerba Houmet Essouk', 'Djerba Midoun', 'Djerba Ajim', 'Sidi Makhlouf'],
  'Tataouine': ['Tataouine Nord', 'Tataouine Sud', 'Bir Lahmar', 'Ghomrassen', 'Dehiba', 'Remada'],
  'Gafsa': ['Gafsa Nord', 'Gafsa Sud', 'Métlaoui', 'Moularès', 'Redeyef', 'Sened', 'El Ksar', 'Belkhir'],
  'Tozeur': ['Tozeur', 'Degueche', 'Hazoua', 'Nefta', 'Tameghza'],
  'Kébili': ['Kébili Nord', 'Kébili Sud', 'Douz', 'Souk Lahad', 'Bechri', 'Faouar', 'El Golâa']
};

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchData, setSearchData] = useState({
    wilaya: '',
    delegation: '',
    startDate: '',
    endDate: ''
  });
  const [wilayas, setWilayas] = useState([]);
  const [delegations, setDelegations] = useState([]);

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

    setWilayas(wilayasData);
  }, []);

  useEffect(() => {
    if (searchData.wilaya) {
      setDelegations(delegationsData[searchData.wilaya] || []);
    } else {
      setDelegations([]);
    }
  }, [searchData.wilaya]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.delegation) params.append('delegation', searchData.delegation);
    if (searchData.wilaya) params.append('city', searchData.wilaya);
    if (searchData.startDate) params.append('startDate', searchData.startDate);
    if (searchData.endDate) params.append('endDate', searchData.endDate);
    navigate(`/cars?${params.toString()}`);
  };

  const handleCarTypeClick = (type) => {
    navigate(`/cars?type=${type}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Navbar />
      
      {/* Hero Section مع صورة خلفية */}
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
            استأجر سيارتك بسهولة في تونس، بأمان وبدون وسطاء
          </h1>
          <p className="hero-subtitle">
            اختر سيارتك من أشخاص موثوقين في مدينتك وابدأ رحلتك اليوم
          </p>
          
          {/* Trust Signals */}
          <div className="trust-signals">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span className="trust-text">الدفع الآمن</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⭐</span>
              <span className="trust-text">تقييمات حقيقية</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🕒</span>
              <span className="trust-text">دعم فوري</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">📋</span>
              <span className="trust-text">وثائق مؤمنة</span>
            </div>
          </div>
          
          <Link to="/cars" className="hero-cta-button">
            استكشف السيارات
          </Link>
        </div>
      </div>

      {/* Search Hero */}
      <div className="search-hero">
        <div className="search-container">
          <h2 className="search-title">
            Location de voitures entre particuliers et professionnels en Tunisie
          </h2>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-field">
              <input
                type="text"
                placeholder="Où souhaitez-vous louer ?"
                value={searchData.wilaya}
                onChange={(e) => setSearchData({...searchData, wilaya: e.target.value, delegation: ''})}
                list="wilayas-list"
                className="search-input"
              />
              <datalist id="wilayas-list">
                {wilayas.map(w => <option key={w} value={w} />)}
              </datalist>
              
              {searchData.wilaya && delegations.length > 0 && (
                <select
                  value={searchData.delegation}
                  onChange={(e) => setSearchData({...searchData, delegation: e.target.value})}
                  className="delegation-select"
                >
                  <option value="">Choisir une délégation</option>
                  {delegations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>
            
            <div className="search-field">
              <input
                type="date"
                value={searchData.startDate}
                onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                min={today}
                className="search-input"
                placeholder="Date de début"
              />
            </div>
            
            <div className="search-field">
              <input
                type="date"
                value={searchData.endDate}
                onChange={(e) => setSearchData({...searchData, endDate: e.target.value})}
                min={searchData.startDate || today}
                className="search-input"
                placeholder="Date de fin"
              />
            </div>
            
            <button type="submit" className="search-button">
              Rechercher
            </button>
          </form>
          
          <p className="search-note">
            Location de voitures entre particuliers et professionnels
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
            <h3 className="step-title">Trouvez une voiture près de vous</h3>
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
          <Link to={user ? "/add-car" : "/register"} className="rent-button">
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