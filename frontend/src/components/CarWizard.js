import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';
import './CarWizard.css';

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
  'Kasserine': ['Kasserine Nord', 'Kasserine Sud', 'El Ayoun', 'Fériana', 'Foussana', 'Haïdra', 'Hassi El Ferid', 'Jedelienne', 'Majel Bel Abbès', 'Sbeïtla', 'Sbiba', 'Thala'],
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

// ========== قائمة الماركات ==========
const carBrandsList = [
  'Peugeot', 'Renault', 'Citroën', 'Volkswagen', 'Toyota', 'Hyundai', 'Kia', 
  'Fiat', 'Dacia', 'Mercedes-Benz', 'BMW', 'Audi', 'Nissan', 'Seat', 'Skoda', 
  'Suzuki', 'Mitsubishi', 'MG', 'Chery', 'Ford', 'Opel', 'Honda', 'Mazda', 
  'Volvo', 'Jeep', 'Land Rover', 'Porsche', 'Tesla', 'BYD', 'Geely', 'Lynk & Co',
  'Alfa Romeo', 'Jaguar', 'Lexus', 'Mini', 'Smart', 'SsangYong', 'Subaru', 'Tata',
  'Autre'
];

// ========== قائمة خيارات السيارة الكاملة ==========
const allFeatures = [
  'GPS', 'Bluetooth', 'Caméra de recul', 'Radar de stationnement', 
  'Climatisation', 'Régulateur de vitesse', 'Sièges chauffants', 
  'Toit ouvrant', 'USB', 'Apple CarPlay', 'Android Auto', 'Start & Stop',
  'Vitres électriques', 'Rétroviseurs électriques', 'Direction assistée',
  'ABS', 'Airbags', 'Allumage automatique des phares', 'Essuie-glaces automatiques'
];

// ========== Types de voiture ==========
const carTypes = [
  { value: 'Citadine', icon: '🚗', desc: 'Petite voiture idéale pour la ville' },
  { value: 'SUV', icon: '🚙', desc: 'Véhicule spacieux pour les voyages' },
  { value: 'Berline', icon: '🚘', desc: 'Confortable pour les longs trajets' },
  { value: 'Utilitaire', icon: '🚚', desc: 'Idéal pour le transport' },
  { value: 'Luxe', icon: '💎', desc: 'Voiture haut de gamme' },
  { value: 'Économique', icon: '💰', desc: 'Location à petit prix' }
];

const CarWizard = ({ initialData, onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [insuranceFrontPreview, setInsuranceFrontPreview] = useState(null);
  const [insuranceBackPreview, setInsuranceBackPreview] = useState(null);
  const saveTimeoutRef = useRef(null);
  
  // State for step 15 (price and caution)
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [isCustomCaution, setIsCustomCaution] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const [customCaution, setCustomCaution] = useState('');
  
  // State for delegations
  const [availableDelegations, setAvailableDelegations] = useState([]);
  
  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || '',
    mileage: initialData?.mileage || '',
    licensePlate: '',
    registrationCountry: 'Tunisie',
    registrationYear: '',
    fuelType: '',
    transmission: '',
    doors: 4,
    seats: 5,
    features: [],
    carType: 'Berline', // ✅ nouveau champ
    userType: 'particulier',
    ownerBirthDate: '',
    paymentPlan: 'hebdomadaire',
    ownerPhone: '',
    ownerPhoneCountry: 'Tunisie',
    parkingType: '',
    address: '',
    city: initialData?.location || '',
    delegation: initialData?.delegation || '',
    deliveryMethod: '',
    pricePerDay: 0,
    caution: 500,
    carImages: [],
    insuranceFront: null,
    insuranceBack: null
  });

  // حساب نسبة التقدم (16 خطوة)
  const getProgressPercentage = () => {
    return Math.round((step / 16) * 100);
  };

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const { data } = await API.get('/cars/wizard/get');
        if (data.data) {
          setFormData(prev => ({ ...prev, ...data.data.data }));
          setStep(data.data.step);
        }
      } catch (err) {
        console.error('Error fetching draft:', err);
      }
    };
    fetchDraft();
  }, []);

  // تحديث المعتمديات عند تغيير الولاية
  useEffect(() => {
    if (formData.city && delegationsByCity[formData.city]) {
      setAvailableDelegations(delegationsByCity[formData.city]);
    } else {
      setAvailableDelegations([]);
    }
  }, [formData.city]);

  // Sauvegarde automatique
  const saveDraft = async (currentStep, newData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await API.post('/cars/wizard/save', {
          step: currentStep,
          data: newData
        });
        console.log('✅ Auto-saved');
      } catch (err) {
        console.error('Error saving draft:', err);
      } finally {
        setSaving(false);
      }
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          features: [...prev.features, name]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          features: prev.features.filter(f => f !== name)
        }));
      }
      saveDraft(step, { ...formData, features: formData.features });
      return;
    }
    
    if (type === 'number') {
      newValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    saveDraft(step, { ...formData, [name]: newValue });
  };

  const handleNext = async () => {
    // Vérification des champs obligatoires selon l'étape
    if (step === 1) {
      if (!formData.brand || !formData.model || !formData.year || !formData.mileage || !formData.city || !formData.delegation) {
        showError('Veuillez remplir tous les champs obligatoires');
        return;
      }
    }
    
    setLoading(true);
    await saveDraft(step + 1, formData);
    setStep(step + 1);
    setLoading(false);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    console.log('🔵 CONFIRM BUTTON CLICKED');
    setLoading(true);
    
    try {
      const requiredFields = [
        'brand', 'model', 'year', 'mileage', 'licensePlate', 
        'registrationCountry', 'registrationYear', 'fuelType', 'transmission', 
        'parkingType', 'address', 'city', 'delegation', 'deliveryMethod', 'pricePerDay', 'carType'
      ];
      
      const missingFields = [];
      for (const field of requiredFields) {
        const value = formData[field];
        if (!value || value === '' || value === undefined || value === null) {
          missingFields.push(field);
        }
      }
      
      if (missingFields.length > 0) {
        showError(`Veuillez remplir tous les champs requis: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
      
      if (!formData.carImages || formData.carImages.length === 0) {
        showError('Veuillez ajouter au moins une photo de votre voiture');
        setLoading(false);
        return;
      }
      
      const formDataToSend = new FormData();
      
      const textFields = [
        'brand', 'model', 'year', 'mileage', 'licensePlate', 
        'registrationCountry', 'registrationYear', 'fuelType', 'transmission', 
        'parkingType', 'address', 'city', 'delegation', 'deliveryMethod', 
        'pricePerDay', 'userType', 'paymentPlan', 'ownerPhone', 'ownerPhoneCountry',
        'doors', 'seats', 'caution', 'carType'
      ];
      
      textFields.forEach(field => {
        const value = formData[field];
        if (value !== undefined && value !== null && value !== '') {
          formDataToSend.append(field, String(value));
        }
      });
      
      if (formData.features && formData.features.length > 0) {
        formData.features.forEach(feature => {
          formDataToSend.append('features[]', feature);
        });
      }
      
      if (formData.ownerBirthDate) {
        formDataToSend.append('ownerBirthDate', formData.ownerBirthDate);
      }
      
      formData.carImages.forEach((file) => {
        formDataToSend.append('images', file);
      });
      
      if (formData.insuranceFront) {
        formDataToSend.append('insuranceFront', formData.insuranceFront);
      }
      if (formData.insuranceBack) {
        formDataToSend.append('insuranceBack', formData.insuranceBack);
      }
      
      const { data } = await API.post('/cars/wizard/complete', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });
      
      if (data.success) {
        showSuccess('✅ Votre voiture est maintenant en ligne !');
        if (onComplete) onComplete();
        navigate('/owner-cars?tab=cars');
      } else {
        showError(data.message || 'Erreur lors de l\'ajout de la voiture');
      }
    } catch (err) {
      console.error('Error:', err);
      let errorMessage = 'Échec de l\'ajout. ';
      if (err.response) {
        errorMessage += err.response.data?.message || 'Erreur serveur.';
      } else if (err.request) {
        errorMessage += 'Pas de réponse du serveur.';
      } else {
        errorMessage += err.message;
      }
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER STEP 1 ==========
  const renderStep1 = () => {
    const tunisianCities = [
      'Tunis', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte', 'Ariana', 'Ben Arous', 'Manouba',
      'Gabès', 'Gafsa', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Mahdia', 'Médenine', 
      'Kébili', 'Tozeur', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Zaghouan', 'Monastir'
    ];

    const isCustomBrand = formData.brand && !carBrandsList.includes(formData.brand) && formData.brand !== 'Autre';
    const isAutreSelected = formData.brand === 'Autre';

    return (
      <div className="wizard-step">
        <h2>Confirmez le modèle de votre voiture</h2>
        
        <div className="form-group">
          <label>Marque *</label>
          {isCustomBrand || isAutreSelected ? (
            <input
              type="text"
              name="brand"
              value={formData.brand === 'Autre' ? '' : formData.brand}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, brand: e.target.value }));
                saveDraft(step, { ...formData, brand: e.target.value });
              }}
              placeholder="Entrez la marque de votre voiture"
              required
            />
          ) : (
            <select name="brand" value={formData.brand} onChange={handleChange} required>
              <option value="">Sélectionner une marque</option>
              {carBrandsList.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          )}
          <small className="form-hint">
            {!isCustomBrand && !isAutreSelected ? 'Vous pouvez aussi sélectionner "Autre" pour saisir une marque personnalisée' : 'Entrez la marque exacte de votre véhicule'}
          </small>
        </div>
        
        <div className="form-group">
          <label>Modèle *</label>
          <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="Ex: Clio, 208, EcoSport..." />
          <small className="form-hint">Entrez le modèle exact de votre voiture</small>
        </div>
        
        <div className="form-group">
          <label>Année de fabrication *</label>
          <select name="year" value={formData.year} onChange={handleChange} required>
            <option value="">Sélectionner une année</option>
            {[...Array(16)].map((_, i) => {
              const year = 2015 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <small className="form-hint">Année de première mise en circulation</small>
        </div>
        
        <div className="form-group">
          <label>Kilométrage *</label>
          <select name="mileage" value={formData.mileage} onChange={handleChange} required>
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
        
        <div className="form-group">
          <label>Gouvernorat *</label>
          <select name="city" value={formData.city} onChange={handleChange} required>
            <option value="">Sélectionner un gouvernorat</option>
            {tunisianCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Délégation *</label>
          <select name="delegation" value={formData.delegation} onChange={handleChange} required disabled={!formData.city}>
            <option value="">Sélectionner une délégation</option>
            {availableDelegations.map(delegation => (
              <option key={delegation} value={delegation}>{delegation}</option>
            ))}
          </select>
          {!formData.city && (
            <small className="form-hint">Veuillez d'abord sélectionner un gouvernorat</small>
          )}
        </div>
        
        <p className="step-note">dans quelques minutes, votre annonce sera mise en ligne</p>
        <button onClick={handleNext} className="step-button">Confirmer</button>
      </div>
    );
  };

  // ========== RENDER STEP 2 ==========
  const renderStep2 = () => (
    <div className="wizard-step">
      <h2>Inscrire ma voiture</h2>
      <p>quelle est l'immatriculation ?</p>
      <div className="form-group">
        <label>Plaque d'immatriculation *</label>
        <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="123 TUN 456" />
      </div>
      <div className="form-group">
        <label>Pays d'immatriculation</label>
        <select name="registrationCountry" value={formData.registrationCountry} onChange={handleChange}>
          <option value="Tunisie">Tunisie</option>
          <option value="Libye">Libye</option>
          <option value="Algérie">Algérie</option>
          <option value="Maroc">Maroc</option>
        </select>
      </div>
      <div className="form-group">
        <label>Année d'immatriculation *</label>
        <select name="registrationYear" value={formData.registrationYear} onChange={handleChange}>
          <option value="">Sélectionner</option>
          {[...Array(19)].map((_, i) => {
            const year = 2012 + i;
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>
      </div>
      <p className="step-note">information indiquée sur la carte grise</p>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Suivant</button>
      </div>
    </div>
  );

  // ========== RENDER STEP 3 ==========
  const renderStep3 = () => (
    <div className="wizard-step">
      <h2>Confirmez le kilométrage</h2>
      <div className="form-group">
        <label>Kilométrage</label>
        <select name="mileage" value={formData.mileage} onChange={handleChange}>
          <option value="0-15000">0-15000 km</option>
          <option value="15000-50000">15000-50000 km</option>
          <option value="50000-100000">50000-100000 km</option>
          <option value="100000-150000">100000-150000 km</option>
          <option value="150000-200000">150000-200000 km</option>
          <option value="200000+">200000+ km</option>
        </select>
      </div>
      <p className="step-note">cette information nous permet d'assurer la sécurité et la qualité de notre flotte</p>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Confirmer</button>
      </div>
    </div>
  );

  // ========== RENDER STEP 4 ==========
  const renderStep4 = () => (
    <div className="wizard-step">
      <h2>Ajouter plus de détails</h2>
      <div className="form-group">
        <label>Carburant *</label>
        <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
          <option value="">Sélectionner</option>
          <option value="Essence">Essence</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybride">Hybride</option>
          <option value="Électrique">Électrique</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
      <div className="form-group">
        <label>Boîte de vitesse *</label>
        <select name="transmission" value={formData.transmission} onChange={handleChange}>
          <option value="">Sélectionner</option>
          <option value="Manuelle">Manuelle</option>
          <option value="Automatique">Automatique</option>
        </select>
      </div>
      <p className="step-note">Ces informations aideront les locataires à faire le meilleur choix</p>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Suivant</button>
      </div>
    </div>
  );

  // ========== RENDER STEP 5 ==========
  const renderStep5 = () => (
    <div className="wizard-step">
      <h2>Ajouter plus de détails</h2>
      <div className="form-group">
        <label>Nombre de portes</label>
        <div className="counter">
          <button type="button" onClick={() => setFormData(prev => ({ ...prev, doors: Math.max(0, prev.doors - 1) }))}>-</button>
          <span>{formData.doors}</span>
          <button type="button" onClick={() => setFormData(prev => ({ ...prev, doors: Math.min(7, prev.doors + 1) }))}>+</button>
        </div>
      </div>
      <div className="form-group">
        <label>Nombre de sièges avec ceinture</label>
        <div className="counter">
          <button type="button" onClick={() => setFormData(prev => ({ ...prev, seats: Math.max(1, prev.seats - 1) }))}>-</button>
          <span>{formData.seats}</span>
          <button type="button" onClick={() => setFormData(prev => ({ ...prev, seats: Math.min(9, prev.seats + 1) }))}>+</button>
        </div>
      </div>
      <p className="step-note">Ces informations aideront les locataires à faire le meilleur choix</p>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Suivant</button>
      </div>
    </div>
  );

  // ========== RENDER STEP 6 (Features) ==========
  const renderStep6 = () => (
    <div className="wizard-step">
      <h2>Rendez votre annonce unique</h2>
      <p className="step-note">Sélectionnez les équipements de votre voiture</p>
      <div className="features-grid">
        {allFeatures.map(feature => (
          <label key={feature} className={`feature-item ${formData.features.includes(feature) ? 'active' : ''}`}>
            <input type="checkbox" name={feature} checked={formData.features.includes(feature)} onChange={handleChange} />
            <span>{feature}</span>
          </label>
        ))}
      </div>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Suivant</button>
      </div>
    </div>
  );

  // ========== RENDER STEP 7 (Type de voiture - NOUVEAU) ==========
  const renderStep7 = () => {
    return (
      <div className="wizard-step">
        <h2>Quel type de véhicule proposez-vous ?</h2>
        <p className="step-note">Sélectionnez la catégorie qui correspond le mieux à votre voiture</p>
        
        <div className="car-type-grid">
          {carTypes.map(type => (
            <div
              key={type.value}
              className={`car-type-card ${formData.carType === type.value ? 'active' : ''}`}
              onClick={() => {
                setFormData(prev => ({ ...prev, carType: type.value }));
                saveDraft(step, { ...formData, carType: type.value });
              }}
            >
              <div className="car-type-icon">{type.icon}</div>
              <div className="car-type-name">{type.value}</div>
              <div className="car-type-desc">{type.desc}</div>
            </div>
          ))}
        </div>
        
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button onClick={handleNext} className="step-button">Suivant</button>
        </div>
      </div>
    );
  };

  // ========== RENDER STEP 8 (Particulier/Professionnel) ==========
  const renderStep8 = () => (
    <div className="wizard-step">
      <h2>Louez vous en tant que particulier ou professionnel ?</h2>
      <div className="radio-group">
        <label className={`radio-item ${formData.userType === 'particulier' ? 'active' : ''}`}>
          <input type="radio" name="userType" value="particulier" checked={formData.userType === 'particulier'} onChange={handleChange} />
          <span>Particulier</span>
        </label>
        <label className={`radio-item ${formData.userType === 'professionnel' ? 'active' : ''}`}>
          <input type="radio" name="userType" value="professionnel" checked={formData.userType === 'professionnel'} onChange={handleChange} />
          <span>Professionnel</span>
        </label>
      </div>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Confirmer</button>
      </div>
    </div>
  );

  // ========== RENDER STEP 9 ==========
  const renderStep9 = () => {
    const handleBirthDateChange = (e) => {
      const value = e.target.value;
      setFormData(prev => ({ ...prev, ownerBirthDate: value }));
      saveDraft(step, { ...formData, ownerBirthDate: value });
    };

    return (
      <div className="wizard-step">
        <h2>Quelle est votre date de naissance ?</h2>
        <div className="form-group">
          <label>Date de naissance *</label>
          <input 
            type="date" 
            name="ownerBirthDate" 
            value={formData.ownerBirthDate || ''} 
            onChange={handleBirthDateChange}
          />
          <small className="form-hint">Format: JJ/MM/AAAA (ex: 15/05/1985)</small>
        </div>
        <p className="step-note">nous devons vous demander cette information pour des raisons légales</p>
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button onClick={handleNext} className="step-button">Suivant</button>
        </div>
      </div>
    );
  };

  // ========== RENDER STEP 10 ==========
  const renderStep10 = () => (
    <div className="wizard-step">
      <h2>Confirmer la paiement de frais de services du site</h2>
      <div className="radio-group">
        <label className={`radio-item ${formData.paymentPlan === 'hebdomadaire' ? 'active' : ''}`}>
          <input type="radio" name="paymentPlan" value="hebdomadaire" checked={formData.paymentPlan === 'hebdomadaire'} onChange={handleChange} />
          <span>Paiement hebdomadaire</span>
        </label>
        <label className={`radio-item ${formData.paymentPlan === 'mensuel' ? 'active' : ''}`}>
          <input type="radio" name="paymentPlan" value="mensuel" checked={formData.paymentPlan === 'mensuel'} onChange={handleChange} />
          <span>Paiement mensuel</span>
        </label>
      </div>
      <p className="step-note">لن تدفع أي مبلغ إلا بعد الحجز. المنصة تأخذ 5% من قيمة الحجز.</p>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Confirmer</button>
      </div>
    </div>
  );

  // ========== RENDER STEP 11 ==========
  const renderStep11 = () => (
    <div className="wizard-step">
      <h2>Quel est votre numéro de téléphone ?</h2>
      <div className="phone-group">
        <select name="ownerPhoneCountry" value={formData.ownerPhoneCountry} onChange={handleChange}>
          <option value="Tunisie">Tunisie (+216)</option>
          <option value="Libye">Libye (+218)</option>
          <option value="Algérie">Algérie (+213)</option>
          <option value="Maroc">Maroc (+212)</option>
        </select>
        <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="numéro de téléphone" />
      </div>
      <p className="step-note">nous ne vous contacterons que pour des informations importantes concernant vos locations</p>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Suivant</button>
      </div>
    </div>
  );

  // ========== RENDER STEP 12 ==========
  const renderStep12 = () => (
    <div className="wizard-step">
      <h2>Où garerez vous votre voiture ?</h2>
      <div className="radio-group">
        <label className={`radio-item ${formData.parkingType === 'parking privé' ? 'active' : ''}`}>
          <input type="radio" name="parkingType" value="parking privé" checked={formData.parkingType === 'parking privé'} onChange={handleChange} />
          <span>Dans un parking privé</span>
        </label>
        <label className={`radio-item ${formData.parkingType === 'stationnement public' ? 'active' : ''}`}>
          <input type="radio" name="parkingType" value="stationnement public" checked={formData.parkingType === 'stationnement public'} onChange={handleChange} />
          <span>En stationnement public</span>
        </label>
      </div>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Suivant</button>
      </div>
    </div>
  );

  // ========== RENDER STEP 13 ==========
  const renderStep13 = () => {
    const tunisianCities = [
      'Tunis', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte', 'Ariana', 'Ben Arous', 'Manouba',
      'Gabès', 'Gafsa', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Mahdia', 'Médenine', 
      'Kébili', 'Tozeur', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Zaghouan', 'Monastir'
    ];

    return (
      <div className="wizard-step">
        <h2>Choisissez l'adresse</h2>
        <div className="form-group">
          <label>Adresse *</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Rue, numéro, bâtiment..." />
          <small className="form-hint">Adresse exacte où se trouve la voiture</small>
        </div>
        <div className="form-group">
          <label>Ville / Gouvernorat *</label>
          <select name="city" value={formData.city} onChange={handleChange} required>
            <option value="">Sélectionner une ville</option>
            {tunisianCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Délégation *</label>
          <select name="delegation" value={formData.delegation} onChange={handleChange} required disabled={!formData.city}>
            <option value="">Sélectionner une délégation</option>
            {availableDelegations.map(delegation => (
              <option key={delegation} value={delegation}>{delegation}</option>
            ))}
          </select>
          {!formData.city && (
            <small className="form-hint">Veuillez d'abord sélectionner un gouvernorat</small>
          )}
        </div>
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button onClick={handleNext} className="step-button">Suivant</button>
        </div>
      </div>
    );
  };

  // ========== RENDER STEP 14 ==========
  const renderStep14 = () => {
    const handleDeliverySelect = (method) => {
      setFormData(prev => ({ ...prev, deliveryMethod: method }));
      saveDraft(step, { ...formData, deliveryMethod: method });
    };

    return (
      <div className="wizard-step">
        <h2>Choisissez maintenant un mode de location</h2>
        <div className="delivery-methods">
          <div 
            className={`delivery-method ${formData.deliveryMethod === 'livraison au client' ? 'active' : ''}`}
            onClick={() => handleDeliverySelect('livraison au client')}
          >
            <div className="delivery-radio">
              <input 
                type="radio" 
                name="deliveryMethod" 
                value="livraison au client"
                checked={formData.deliveryMethod === 'livraison au client'}
                onChange={() => {}}
                readOnly
              />
              <span>🚚 Vous livrez la voiture au locataire</span>
            </div>
            <p>Vous livrez la voiture à l'adresse du locataire</p>
          </div>
          <div 
            className={`delivery-method ${formData.deliveryMethod === 'client rencontre le conducteur' ? 'active' : ''}`}
            onClick={() => handleDeliverySelect('client rencontre le conducteur')}
          >
            <div className="delivery-radio">
              <input 
                type="radio" 
                name="deliveryMethod" 
                value="client rencontre le conducteur"
                checked={formData.deliveryMethod === 'client rencontre le conducteur'}
                onChange={() => {}}
                readOnly
              />
              <span>🤝 Client rencontre le conducteur</span>
            </div>
            <p>Le client vient récupérer la voiture à l'adresse indiquée</p>
          </div>
        </div>
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button onClick={handleNext} className="step-button">Choisir</button>
        </div>
      </div>
    );
  };

  // ========== RENDER STEP 15 (Prix) ==========
  const renderStep15 = () => {
    const priceOptions = ['50', '60', '70', '80', '90', '100', '120', '150', '200', 'Autre'];
    const cautionOptions = ['200', '300', '500', '600', '800', '1000', '1500', 'Autre'];

    return (
      <div className="wizard-step">
        <h2>💰 Définissez vos tarifs</h2>
        
        <div className="form-group">
          <label>💰 Prix par jour (TND) *</label>
          {isCustomPrice ? (
            <input
              type="number"
              value={customPrice}
              onChange={(e) => {
                setCustomPrice(e.target.value);
                setFormData(prev => ({ ...prev, pricePerDay: parseFloat(e.target.value) || 0 }));
                saveDraft(step, { ...formData, pricePerDay: parseFloat(e.target.value) || 0 });
              }}
              placeholder="Entrez le prix personnalisé"
              min="0"
              step="1"
              required
              className="price-input-large"
            />
          ) : (
            <select
              name="pricePerDay"
              value={formData.pricePerDay || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'Autre') {
                  setIsCustomPrice(true);
                  setFormData(prev => ({ ...prev, pricePerDay: 0 }));
                } else {
                  setFormData(prev => ({ ...prev, pricePerDay: parseFloat(value) || 0 }));
                  saveDraft(step, { ...formData, pricePerDay: parseFloat(value) || 0 });
                }
              }}
              required
              className="price-select"
            >
              <option value="">Sélectionner un prix</option>
              {priceOptions.map(price => (
                <option key={price} value={price}>{price === 'Autre' ? 'Autre (saisir manuellement)' : `${price} TND / jour`}</option>
              ))}
            </select>
          )}
          <small className="form-hint">
            {!isCustomPrice ? 'Vous pouvez aussi sélectionner "Autre" pour saisir un prix personnalisé' : 'Entrez le prix que vous souhaitez facturer par jour'}
          </small>
        </div>
        
        <div className="caution-section">
          <h3>🔒 Dépôt de garantie (Caution)</h3>
          <p className="caution-description">
            Le dépôt de garantie est versé <strong>en espèces</strong> par le locataire au propriétaire le jour de la remise des clés.
          </p>
          
          <div className="warning-box">
            <p className="warning-icon">⚠️</p>
            <div className="warning-text">
              <strong>Important :</strong>
              <ul>
                <li>✅ Paiement de la caution en <strong>espèces</strong> entre propriétaire et locataire</li>
                <li>❌ La plateforme <strong>ne gère pas</strong> le paiement de la caution</li>
                <li>⚠️ La plateforme <strong>n'est pas responsable</strong> en cas d'accident ou de litige</li>
                <li>📝 Un constat d'état des lieux doit être signé par les deux parties</li>
              </ul>
            </div>
          </div>
          
          <div className="form-group">
            <label>Montant de la caution (TND)</label>
            {isCustomCaution ? (
              <input
                type="number"
                value={customCaution}
                onChange={(e) => {
                  setCustomCaution(e.target.value);
                  setFormData(prev => ({ ...prev, caution: parseFloat(e.target.value) || 0 }));
                  saveDraft(step, { ...formData, caution: parseFloat(e.target.value) || 0 });
                }}
                placeholder="Entrez le montant personnalisé"
                min="0"
                step="50"
                className="caution-input-large"
              />
            ) : (
              <select
                name="caution"
                value={formData.caution || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'Autre') {
                    setIsCustomCaution(true);
                    setFormData(prev => ({ ...prev, caution: 0 }));
                  } else {
                    setFormData(prev => ({ ...prev, caution: parseFloat(value) || 0 }));
                    saveDraft(step, { ...formData, caution: parseFloat(value) || 0 });
                  }
                }}
                className="caution-select"
              >
                <option value="">Sélectionner un montant</option>
                {cautionOptions.map(caution => (
                  <option key={caution} value={caution}>{caution === 'Autre' ? 'Autre (saisir manuellement)' : `${caution} TND`}</option>
                ))}
              </select>
            )}
            <small className="form-hint">
              {!isCustomCaution ? 'Recommandé: 500 à 1000 TND selon la voiture' : 'Entrez le montant de la caution'}
            </small>
          </div>
        </div>
        
        <div className="info-box">
          <h4>📊 Calcul de vos gains</h4>
          <p>💰 <strong>Prix par jour:</strong> {formData.pricePerDay || 0} TND/jour</p>
          <p>💸 <strong>Commission plateforme (5%):</strong> -{((formData.pricePerDay || 0) * 0.05).toFixed(2)} TND/jour</p>
          <p>✨ <strong>Vos gains nets par jour:</strong> {((formData.pricePerDay || 0) * 0.95).toFixed(2)} TND</p>
          <p>🔒 <strong>Caution:</strong> {formData.caution || 0} TND (versée en espèces)</p>
        </div>
        
        <div className="motivation-message">
          🚀 Votre voiture est presque prête à être louée !<br />
          Encore une étape pour publier votre annonce.
        </div>
        
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button onClick={handleNext} className="step-button">
            Suivant →
          </button>
        </div>
      </div>
    );
  };

  // ========== RENDER STEP 16 (Photos) ==========
  const renderStep16 = () => {
    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      console.log(`📸 Selected ${files.length} images`);
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
      setFormData(prev => ({ ...prev, carImages: files }));
    };
    
    const handleInsuranceFrontUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setInsuranceFrontPreview(URL.createObjectURL(file));
        setFormData(prev => ({ ...prev, insuranceFront: file }));
      }
    };
    
    const handleInsuranceBackUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setInsuranceBackPreview(URL.createObjectURL(file));
        setFormData(prev => ({ ...prev, insuranceBack: file }));
      }
    };
    
    const imageCount = formData.carImages?.length || 0;
    
    return (
      <div className="wizard-step">
        <h2>📸 Photos de votre voiture</h2>
        <p className="step-note">Ajoutez au moins 4 photos pour que votre annonce soit plus attractive</p>
        
        <div className="photo-guidelines">
          <h4>Photos recommandées :</h4>
          <div className="photo-types">
            <div className="photo-type">🚗 Avant de la voiture</div>
            <div className="photo-type">🔙 Arrière de la voiture</div>
            <div className="photo-type">🪑 Intérieur (sièges)</div>
            <div className="photo-type">📊 Tableau de bord</div>
          </div>
          <p className="photo-tip">💡 Les annonces avec plusieurs photos reçoivent <strong>3 fois plus de réservations</strong></p>
        </div>
        
        <div className="form-group">
          <label>📸 Photos de la voiture (max 5) *</label>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              <p className="preview-label">{imagePreviews.length} photo(s) sélectionnée(s)</p>
              <div className="preview-grid">
                {imagePreviews.map((src, idx) => (
                  <img key={idx} src={src} alt={`preview-${idx}`} className="preview-thumb" />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>📄 Carte grise (recto) *</label>
          <input type="file" accept="image/*" onChange={handleInsuranceFrontUpload} />
          {insuranceFrontPreview && (
            <img src={insuranceFrontPreview} alt="Carte grise recto" className="preview-thumb" />
          )}
        </div>
        
        <div className="form-group">
          <label>📄 Carte grise (verso) *</label>
          <input type="file" accept="image/*" onChange={handleInsuranceBackUpload} />
          {insuranceBackPreview && (
            <img src={insuranceBackPreview} alt="Carte grise verso" className="preview-thumb" />
          )}
        </div>
        
        {imageCount === 0 && (
          <div className="warning-message">
            ⚠️ Veuillez ajouter au moins une photo de votre voiture pour continuer
          </div>
        )}
        
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button 
            onClick={handleComplete} 
            className="step-button" 
            disabled={loading || imageCount === 0}
          >
            {loading ? 'Envoi en cours...' : 'Publier mon annonce'}
          </button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch(step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();   // ✅ Type de voiture
      case 8: return renderStep8();   // Particulier/Professionnel
      case 9: return renderStep9();   // Date de naissance
      case 10: return renderStep10(); // Paiement frais
      case 11: return renderStep11(); // Téléphone
      case 12: return renderStep12(); // Parking
      case 13: return renderStep13(); // Adresse
      case 14: return renderStep14(); // Mode de location
      case 15: return renderStep15(); // Prix
      case 16: return renderStep16(); // Photos
      default: return null;
    }
  };

  return (
    <div className="wizard-container">
      {/* Barre de progression */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${getProgressPercentage()}%` }}>
          <span className="progress-text">{getProgressPercentage()}%</span>
        </div>
        <div className="progress-step-text">
          Étape {step} sur 16
        </div>
      </div>
      
      {saving && <div className="saving-indicator">💾 Sauvegarde en cours...</div>}
      
      <div className="wizard-progress">
        {[...Array(16)].map((_, i) => (
          <div key={i} className={`progress-step ${step > i + 1 ? 'completed' : step === i + 1 ? 'active' : ''}`}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="wizard-content">
        {renderStep()}
      </div>
    </div>
  );
};

export default CarWizard;