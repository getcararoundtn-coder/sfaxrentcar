import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { AuthContext } from '../context/AuthContext';
import CarWizard from '../components/CarWizard';
import API from '../services/api';
import './RentYourCar.css';

// ========== قائمة الماركات العالمية الشاملة (مع خيار Autre) ==========
const carBrands = [
  'Peugeot', 'Renault', 'Citroën', 'Volkswagen', 'Toyota', 'Hyundai', 'Kia', 
  'Fiat', 'Dacia', 'Mercedes-Benz', 'BMW', 'Audi', 'Nissan', 'Seat', 'Skoda', 
  'Suzuki', 'Mitsubishi', 'MG', 'Chery', 'Ford', 'Opel', 'Honda', 'Mazda', 
  'Volvo', 'Jeep', 'Land Rover', 'Porsche', 'Tesla', 'BYD', 'Geely', 'Lynk & Co',
  'Alfa Romeo', 'Jaguar', 'Lexus', 'Mini', 'Smart', 'SsangYong', 'Subaru', 'Tata',
  'Autre'
];

// ========== الموديلات حسب الماركة ==========
const carModels = {
  'Peugeot': ['208', '2008', '308', '3008', '408', '508', '5008', 'Rifter', 'Partner', 'Expert', 'Boxer', '108', '107', 'RCZ'],
  'Renault': ['Clio', 'Captur', 'Megane', 'Scenic', 'Espace', 'Kadjar', 'Austral', 'Arkana', 'Talisman', 'Zoe', 'Twingo', 'Kangoo', 'Master', 'Trafic'],
  'Citroën': ['C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C5 Aircross', 'Berlingo', 'Jumpy', 'SpaceTourer', 'Ami'],
  'Volkswagen': ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc', 'Taigo', 'T-Cross', 'Touareg', 'Touran', 'Caddy', 'Transporter', 'ID.3', 'ID.4', 'ID.Buzz'],
  'Toyota': ['Yaris', 'Yaris Cross', 'Corolla', 'Corolla Cross', 'Camry', 'RAV4', 'C-HR', 'Land Cruiser', 'Hilux', 'Aygo', 'Aygo X', 'Proace'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Santa Fe', 'Kona', 'Bayon', 'IONIQ', 'IONIQ 5'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'Stonic', 'Niro', 'EV6'],
  'Fiat': ['500', '500X', '500L', 'Panda', 'Tipo', 'Doblo', 'Ducato'],
  'Dacia': ['Sandero', 'Sandero Stepway', 'Logan', 'Duster', 'Jogger', 'Spring'],
  'Mercedes-Benz': ['Classe A', 'Classe B', 'Classe C', 'Classe CLA', 'Classe E', 'Classe GLA', 'Classe GLB', 'Classe GLC', 'Classe GLE', 'Vito', 'Sprinter'],
  'BMW': ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'X1', 'X3', 'X5', 'i3', 'i4'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'e-tron'],
  'Nissan': ['Micra', 'Note', 'Qashqai', 'Juke', 'X-Trail', 'Navara', 'Leaf'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'],
  'Suzuki': ['Swift', 'Ignis', 'Vitara', 'S-Cross', 'Jimny'],
  'Mitsubishi': ['Space Star', 'ASX', 'Eclipse Cross', 'Outlander', 'L200'],
  'MG': ['ZS', 'HS', 'MG4', 'MG5'],
  'Chery': ['Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Omoda 5'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma', 'Ranger', 'Transit'],
  'Opel': ['Corsa', 'Astra', 'Mokka', 'Grandland', 'Crossland'],
  'Honda': ['Jazz', 'Civic', 'CR-V', 'HR-V'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90'],
  'Jeep': ['Wrangler', 'Compass', 'Renegade', 'Grand Cherokee'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Discovery', 'Defender'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
  'BYD': ['Atto 3', 'Dolphin', 'Seal', 'Han'],
  'Geely': ['Coolray', 'Azkarra', 'Emgrand'],
  'Lynk & Co': ['01', '02', '03', '05'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale'],
  'Jaguar': ['F-Pace', 'E-Pace', 'I-Pace', 'XE', 'XF'],
  'Lexus': ['UX', 'NX', 'RX', 'ES'],
  'Mini': ['Cooper', 'Countryman', 'Clubman'],
  'Smart': ['Fortwo', 'Forfour', '#1'],
  'SsangYong': ['Tivoli', 'Korando', 'Rexton'],
  'Subaru': ['Forester', 'Outback', 'Crosstrek'],
  'Tata': ['Nexon', 'Harrier', 'Safari'],
  'Autre': []
};

// ========== المعتمديات حسب الولاية ==========
const delegationsByCity = {
  'Tunis': ['Tunis Médina', 'Bab El Bhar', 'Bab Souika', 'Carthage', 'La Goulette', 'La Marsa', 'Le Bardo', 'Le Kram', 'Sidi Bou Said', 'El Omrane', 'Ettahrir', 'Ezzouhour', 'Séjoumi', 'Sidi Hassine', 'Hraïria', 'El Kabaria', 'El Menzah', 'El Ouardia', 'Djebel Jelloud', 'Cité El Khadra', 'Sidi El Béchir'],
  'Sfax': ['Sfax Médina', 'Sfax Ouest', 'Sfax Sud', 'Sakiet Ezzit', 'Sakiet Eddaïer', 'Bir Ali Ben Khalifa', 'El Amra', 'El Hencha', 'Ghraiba', 'Jebiniana', 'Mahrès', 'Menzel Chaker', 'Thyna', 'Agareb', 'Skhira', 'Kerkennah'],
  'Sousse': ['Sousse Médina', 'Sousse Jawhara', 'Sousse Riadh', 'Sousse Sidi Abdelhamid', 'Akouda', 'Bouficha', 'Enfidha', 'Hammam Sousse', 'Hergla', 'Kalâa Kebira', 'Kalâa Seghira', "M'saken", 'Sidi Bou Ali', 'Sidi El Hani', 'Kondar', 'Zaouiet Ksibet Thrayet'],
  'Monastir': ['Monastir', 'Bekalta', 'Bembla', 'Beni Hassen', 'Jemmal', 'Ksar Hellal', 'Ksibet el-Médiouni', 'Moknine', 'Ouerdanine', 'Sahline', 'Sayada-Lamta-Bou Hajar', 'Téboulba', 'Zéramdine'],
  'Nabeul': ['Nabeul', 'Béni Khalled', 'Béni Khiar', 'Bou Argoub', 'Dar Chaâbane El Fehri', 'El Haouaria', 'El Mida', 'Grombalia', 'Hammam Ghezèze', 'Hammamet', 'Kélibia', 'Korba', 'Menzel Bouzelfa', 'Menzel Temime', 'Soliman', 'Takelsa'],
  'Bizerte': ['Bizerte Nord', 'Bizerte Sud', 'El Alia', 'Ghezala', 'Joumine', 'Mateur', 'Menzel Bourguiba', 'Menzel Jemil', 'Ras Jebel', 'Sejnane', 'Tinja', 'Utique', 'Zarzouna', 'Ghar El Melh'],
  'Ariana': ['Ariana Ville', 'Ettadhamen', 'Kalâat el-Andalous', 'La Soukra', 'Mnihla', 'Raoued', 'Sidi Thabet'],
  'Ben Arous': ['Ben Arous', 'Bou Mhel el-Bassatine', 'Ezzahra', 'Fouchana', 'Hammam Chott', 'Hammam Lif', 'Mégrine', 'Mohamedia', 'Mornag', 'Radès', 'El Mourouj'],
  'Manouba': ['Manouba', 'Borj El Amri', 'Djedeida', 'Douar Hicher', 'El Batan', 'Mornaguia', 'Oued Ellil', 'Tebourba'],
  'Gabès': ['Gabès Médina', 'Gabès Ouest', 'Gabès Sud', 'El Hamma', 'El Hamma Ouest', 'Mareth-Dkhila', 'Menzel El Habib', 'Matmata', 'Métouia', 'Nouvelle Matmata', 'Oudhref', 'Toujane', 'Ghannouch'],
  'Gafsa': ['Gafsa Nord', 'Gafsa Sud', 'Belkhir', 'El Guettar', 'El Ksar', 'Mdhilla', 'Métlaoui', 'Moularès', 'Redeyef', 'Sened', 'Sidi Aïch', 'Sidi Boubaker', 'Zannouch'],
  'Kairouan': ['Kairouan Nord', 'Kairouan Sud', 'Aïn Djeloula', 'Bou Hajla', 'Chebika', 'Echrarda', 'El Alâa', 'Haffouz', 'Hajeb El Ayoun', 'Menzel Mehiri', 'Nasrallah', 'Oueslatia', 'Sbikha'],
  'Kasserine': ['Kasserine Nord', 'Kasserine Sud', 'El Ayoun', 'Ezzouhour', 'Fériana', 'Foussana', 'Haïdra', 'Hassi El Ferid', 'Jedelienne', 'Majel Bel Abbès', 'Sbeïtla', 'Sbiba', 'Thala'],
  'Sidi Bouzid': ['Sidi Bouzid Est', 'Sidi Bouzid Ouest', 'Bir El Hafey', 'Cebbala Ouled Asker', 'Essaïda', 'Hichria', 'Jilma', 'Meknassy', 'Menzel Bouzaiane', 'Mezzouna', 'Ouled Haffouz', 'Regueb', 'Sidi Ali Ben Aoun', 'Souk Jedid'],
  'Mahdia': ['Mahdia', 'Bou Merdes', 'Chebba', 'Chorbane', 'El Bradâa', 'El Jem', 'Essouassi', 'Hebira', 'Ksour Essef', 'Melloulèche', 'Ouled Chamekh', 'Rejiche', 'Sidi Alouane'],
  'Médenine': ['Médenine Nord', 'Médenine Sud', 'Ben Gardane', 'Beni Khedache', 'Djerba - Ajim', 'Djerba - Houmt Souk', 'Djerba - Midoun', 'Sidi Makhlouf', 'Zarzis'],
  'Kébili': ['Kébili Nord', 'Kébili Sud', 'Douz Nord', 'Douz Sud', 'Faouar', 'Rjim Maatoug', 'Souk Lahad'],
  'Tozeur': ['Tozeur', 'Degache', 'El Hamma du Jérid', 'Hazoua', 'Nefta', 'Tameghza'],
  'Béja': ['Béja Nord', 'Béja Sud', 'Amdoun', 'Goubellat', 'Majaz El Bab', 'Nefza', 'Téboursouk', 'Testour', 'Thibar'],
  'Jendouba': ['Jendouba', 'Jendouba Nord', 'Aïn Draham', 'Balta-Bou Aouane', 'Bou Salem', 'Fernana', 'Ghardimaou', 'Oued Meliz', 'Tabarka'],
  'Le Kef': ['Le Kef Est', 'Le Kef Ouest', 'Dahmani', 'El Ksour', 'Jérissa', 'Kalâat Khasba', 'Kalaat Senan', 'Nebeur', 'Sakiet Sidi Youssef', 'Sers', 'Tajerouine', 'Touiref'],
  'Siliana': ['Siliana Nord', 'Siliana Sud', 'Bargou', 'Bou Arada', 'El Aroussa', 'El Krib', 'Gaâfour', 'Kesra', 'Makthar', 'Rouhia', 'Sidi Bou Rouis'],
  'Zaghouan': ['Zaghouan', 'Bir Mcherga', 'El Fahs', 'Nadhour', 'Saouaf', 'Zriba']
};

// ========== الولايات التونسية (مع خيار Autre) ==========
const tunisianCities = [
  'Tunis', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte', 'Ariana', 'Ben Arous', 'Manouba',
  'Gabès', 'Gafsa', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Mahdia', 'Médenine', 
  'Kébili', 'Tozeur', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Zaghouan', 
  'Monastir', 'Autre'
];

const RentYourCar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [isCustomDelegation, setIsCustomDelegation] = useState(false);
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customDelegation, setCustomDelegation] = useState('');
  const [initialData, setInitialData] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    location: '',
    delegation: '',
    deliveryMethod: ''
  });
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [availableDelegations, setAvailableDelegations] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // تحديث الموديلات عند تغيير الماركة
  useEffect(() => {
    if (initialData.brand && initialData.brand !== 'Autre') {
      setAvailableModels(carModels[initialData.brand] || []);
      setInitialData(prev => ({ ...prev, model: '' }));
    } else if (initialData.brand === 'Autre') {
      setAvailableModels([]);
    } else {
      setAvailableModels([]);
    }
  }, [initialData.brand]);

  // ✅ تحديث المعتمديات عند تغيير الولاية (ربط صحيح)
  useEffect(() => {
    if (initialData.location && initialData.location !== 'Autre') {
      setAvailableDelegations(delegationsByCity[initialData.location] || []);
      setInitialData(prev => ({ ...prev, delegation: '' }));
    } else if (initialData.location === 'Autre') {
      setAvailableDelegations([]);
    } else {
      setAvailableDelegations([]);
    }
  }, [initialData.location]);

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    
    const finalBrand = initialData.brand === 'Autre' ? customBrand : initialData.brand;
    const finalModel = initialData.model === 'Autre' ? customModel : initialData.model;
    const finalCity = initialData.location === 'Autre' ? customCity : initialData.location;
    const finalDelegation = initialData.delegation === 'Autre' ? customDelegation : initialData.delegation;
    
    if (!finalBrand || !finalModel || !initialData.year || 
        !initialData.mileage || !finalCity || !finalDelegation) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    setLoading(true);
    try {
      await API.post('/cars/wizard/save', {
        step: 1,
        data: { 
          ...initialData, 
          brand: finalBrand,
          model: finalModel,
          location: finalCity,
          delegation: finalDelegation
        }
      });
      setShowWizard(true);
    } catch (err) {
      console.error('Error saving initial data:', err);
      alert('حدث خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInitialData({ ...initialData, [name]: value });
    
    // Gestion des champs "Autre"
    if (name === 'brand' && value === 'Autre') {
      setIsCustomBrand(true);
      setIsCustomModel(false);
      setIsCustomCity(false);
      setIsCustomDelegation(false);
    } else if (name === 'brand' && value !== 'Autre') {
      setIsCustomBrand(false);
      setCustomBrand('');
    }
    
    if (name === 'model' && value === 'Autre') {
      setIsCustomModel(true);
    } else if (name === 'model' && value !== 'Autre') {
      setIsCustomModel(false);
      setCustomModel('');
    }
    
    if (name === 'location' && value === 'Autre') {
      setIsCustomCity(true);
      setIsCustomDelegation(false);
    } else if (name === 'location' && value !== 'Autre') {
      setIsCustomCity(false);
      setCustomCity('');
    }
    
    if (name === 'delegation' && value === 'Autre') {
      setIsCustomDelegation(true);
    } else if (name === 'delegation' && value !== 'Autre') {
      setIsCustomDelegation(false);
      setCustomDelegation('');
    }
  };

  const handleCustomFieldChange = (field, value) => {
    if (field === 'brand') {
      setCustomBrand(value);
      setInitialData(prev => ({ ...prev, brand: value }));
    } else if (field === 'model') {
      setCustomModel(value);
      setInitialData(prev => ({ ...prev, model: value }));
    } else if (field === 'city') {
      setCustomCity(value);
      setInitialData(prev => ({ ...prev, location: value }));
    } else if (field === 'delegation') {
      setCustomDelegation(value);
      setInitialData(prev => ({ ...prev, delegation: value }));
    }
  };

  if (!user) {
    return null;
  }

  if (showWizard) {
    return <CarWizard initialData={initialData} />;
  }

  return (
    <>
      <Navbar />
      <div className="rent-car-page">
        {/* الصورة في الأعلى */}
        <div className="rent-car-top">
          <img 
            src="/images/car-rental.png" 
            alt="Rent your car"
            className="rent-car-image"
          />
        </div>
        
        {/* المحتوى */}
        <div className="rent-car-left">
          <h1 className="rent-car-title">اربح المال عند كراء سيارتك</h1>
          <p className="rent-car-subtitle">inscription votre voiture</p>

          <form onSubmit={handleInitialSubmit} className="rent-car-form">
            {/* Marque */}
            <div className="form-group">
              <label>Brand de voiture *</label>
              {isCustomBrand ? (
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => handleCustomFieldChange('brand', e.target.value)}
                  placeholder="Entrez la marque de votre voiture"
                  required
                />
              ) : (
                <select
                  name="brand"
                  value={initialData.brand}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner une marque</option>
                  {carBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              )}
              <small className="form-hint">
                {!isCustomBrand ? 'Vous pouvez aussi sélectionner "Autre" pour saisir une marque personnalisée' : 'Entrez la marque exacte de votre véhicule'}
              </small>
            </div>

            {/* Modèle */}
            <div className="form-group">
              <label>Modèle *</label>
              {isCustomModel ? (
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => handleCustomFieldChange('model', e.target.value)}
                  placeholder="Entrez le modèle de votre voiture"
                  required
                />
              ) : (
                <select
                  name="model"
                  value={initialData.model}
                  onChange={handleChange}
                  required
                  disabled={!initialData.brand || initialData.brand === 'Autre'}
                >
                  <option value="">Sélectionner un modèle</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="Autre">Autre (saisir manuellement)</option>
                </select>
              )}
              {!initialData.brand && !isCustomModel && (
                <small className="form-hint">Veuillez d'abord sélectionner une marque</small>
              )}
              {(initialData.brand === 'Autre' || isCustomModel) && (
                <small className="form-hint">Entrez le modèle exact de votre véhicule</small>
              )}
            </div>

            {/* Année */}
            <div className="form-group">
              <label>Année de fabrication *</label>
              <select
                name="year"
                value={initialData.year}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une année</option>
                {[...Array(16)].map((_, i) => {
                  const year = 2015 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
              <small className="form-hint">Année de première mise en circulation (2015-2030)</small>
            </div>

            {/* Kilométrage */}
            <div className="form-group">
              <label>Kilométrage *</label>
              <select name="mileage" value={initialData.mileage} onChange={handleChange} required>
                <option value="">Sélectionner</option>
                <option value="0-15000">0-15000 km</option>
                <option value="15000-50000">15000-50000 km</option>
                <option value="50000-100000">50000-100000 km</option>
                <option value="100000-150000">100000-150000 km</option>
                <option value="150000-200000">150000-200000 km</option>
                <option value="200000+">200000+ km</option>
              </select>
              <small className="form-hint">Cette information aide les locataires à choisir une voiture fiable</small>
            </div>

            {/* Gouvernorat */}
            <div className="form-group">
              <label>Gouvernorat *</label>
              {isCustomCity ? (
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => handleCustomFieldChange('city', e.target.value)}
                  placeholder="Entrez le nom du gouvernorat"
                  required
                />
              ) : (
                <select
                  name="location"
                  value={initialData.location}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un gouvernorat</option>
                  {tunisianCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              )}
              <small className="form-hint">
                {!isCustomCity ? 'Vous pouvez aussi sélectionner "Autre" pour saisir un gouvernorat personnalisé' : 'Entrez le nom exact du gouvernorat'}
              </small>
            </div>

            {/* Délégation */}
            <div className="form-group">
              <label>Délégation *</label>
              {isCustomDelegation ? (
                <input
                  type="text"
                  value={customDelegation}
                  onChange={(e) => handleCustomFieldChange('delegation', e.target.value)}
                  placeholder="Entrez le nom de la délégation"
                  required
                />
              ) : (
                <select
                  name="delegation"
                  value={initialData.delegation}
                  onChange={handleChange}
                  required
                  disabled={!initialData.location || initialData.location === 'Autre'}
                >
                  <option value="">Sélectionner une délégation</option>
                  {availableDelegations.map(delegation => (
                    <option key={delegation} value={delegation}>{delegation}</option>
                  ))}
                  <option value="Autre">Autre (saisir manuellement)</option>
                </select>
              )}
              {!initialData.location && !isCustomCity && (
                <small className="form-hint">Veuillez d'abord sélectionner un gouvernorat</small>
              )}
              {(initialData.location === 'Autre' || isCustomDelegation) && (
                <small className="form-hint">Entrez le nom exact de la délégation</small>
              )}
            </div>

            <button type="submit" disabled={loading} className="start-button">
              {loading ? 'Chargement...' : 'ابدأ الآن'}
            </button>
          </form>

          <div className="delivery-options">
            <h3>طرق الكراء</h3>
            <div className="delivery-option">
              <span className="delivery-icon">🚚</span>
              <div>
                <strong>Vous livrez la voiture au locataire</strong>
                <p>Vous livrez la voiture à l'adresse du locataire</p>
              </div>
            </div>
            <div className="delivery-option">
              <span className="delivery-icon">🏠</span>
              <div>
                <strong>Le locataire vient récupérer la voiture</strong>
                <p>Le client vient récupérer la voiture à l'adresse indiquée</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>كيف تعمل المنصة؟</h3>
            <ul>
              <li>📝 أضف سيارتك في بضع خطوات</li>
              <li>✅ تأكيد الحجز من قبل المستأجر</li>
              <li>💰 استلم المال مباشرة بعد الحجز</li>
              <li>💸 دفع عمولة 5% فقط عند نجاح الحجز</li>
            </ul>
          </div>

          <div className="about-section">
            <a href="/about">à propos</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RentYourCar;