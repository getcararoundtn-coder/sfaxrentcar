import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';
import './CarWizard.css';

// ========== قائمة المعتمديات الكاملة ==========
const delegationsList = [
  // Ariana
  'Ariana Ville', 'Ettadhamen', 'Kalâat el-Andalous', 'La Soukra', 'Mnihla', 'Raoued', 'Sidi Thabet',
  // Béja
  'Amdoun', 'Béja Nord', 'Béja Sud', 'Goubellat', 'Medjez el-Bab', 'Nefza', 'Téboursouk', 'Testour', 'Thibar',
  // Ben Arous
  'Ben Arous', 'Bou Mhel el-Bassatine', 'Ezzahra', 'Fouchana', 'Hammam Chott', 'Hammam Lif', 'Mégrine', 'Mohamedia', 'Mornag', 'Radès', 'El Mourouj',
  // Bizerte
  'Bizerte Nord', 'Bizerte Sud', 'El Alia', 'Ghezala', 'Joumine', 'Mateur', 'Menzel Bourguiba', 'Menzel Jemil', 'Ras Jebel', 'Sejnane', 'Tinja', 'Utique', 'Zarzouna', 'Ghar El Melh',
  // Gabès
  'Gabès Médina', 'Gabès Ouest', 'Gabès Sud', 'El Hamma', 'El Hamma Ouest', 'Mareth-Dkhila', 'Menzel El Habib', 'Matmata', 'Métouia', 'Nouvelle Matmata', 'Oudhref', 'Toujane', 'Ghannouch',
  // Gafsa
  'Belkhir', 'El Guettar', 'El Ksar', 'Gafsa Nord', 'Gafsa Sud', 'Mdhilla', 'Métlaoui', 'Moularès', 'Redeyef', 'Sened', 'Sidi Aïch', 'Sidi Boubaker', 'Zannouch',
  // Jendouba
  'Aïn Draham', 'Balta-Bou Aouane', 'Bou Salem', 'Fernana', 'Ghardimaou', 'Jendouba', 'Jendouba Nord', 'Oued Meliz', 'Tabarka',
  // Kairouan
  'Aïn Djeloula', 'Bou Hajla', 'Chebika', 'Echrarda', 'El Alâa', 'Haffouz', 'Hajeb El Ayoun', 'Kairouan Nord', 'Kairouan Sud', 'Menzel Mehiri', 'Nasrallah', 'Oueslatia', 'Sbikha',
  // Kasserine
  'El Ayoun', 'Ezzouhour', 'Fériana', 'Foussana', 'Haïdra', 'Hassi El Ferid', 'Jedelienne', 'Kasserine Nord', 'Kasserine Sud', 'Majel Bel Abbès', 'Sbeïtla', 'Sbiba', 'Thala',
  // Kébili
  'Douz Nord', 'Douz Sud', 'Faouar', 'Kébili Nord', 'Kébili Sud', 'Rjim Maatoug', 'Souk Lahad',
  // Le Kef
  'Dahmani', 'El Ksour', 'Jérissa', 'Kalâat Khasba', 'Kalaat Senan', 'Kef Est', 'Kef Ouest', 'Nebeur', 'Sakiet Sidi Youssef', 'Sers', 'Tajerouine', 'Touiref',
  // Mahdia
  'Bou Merdes', 'Chebba', 'Chorbane', 'El Bradâa', 'El Jem', 'Essouassi', 'Hebira', 'Ksour Essef', 'Mahdia', 'Melloulèche', 'Ouled Chamekh', 'Rejiche', 'Sidi Alouane',
  // Manouba
  'Borj El Amri', 'Djedeida', 'Douar Hicher', 'El Batan', 'La Manouba', 'Mornaguia', 'Oued Ellil', 'Tebourba',
  // Médenine
  'Ben Gardane', 'Beni Khedache', 'Djerba - Ajim', 'Djerba - Houmt Souk', 'Djerba - Midoun', 'Médenine Nord', 'Médenine Sud', 'Sidi Makhlouf', 'Zarzis',
  // Monastir
  'Bekalta', 'Bembla', 'Beni Hassen', 'Jemmal', 'Ksar Hellal', 'Ksibet el-Médiouni', 'Moknine', 'Monastir', 'Ouerdanine', 'Sahline', 'Sayada-Lamta-Bou Hajar', 'Téboulba', 'Zéramdine',
  // Nabeul
  'Béni Khalled', 'Béni Khiar', 'Bou Argoub', 'Dar Chaâbane El Fehri', 'El Haouaria', 'El Mida', 'Grombalia', 'Hammam Ghezèze', 'Kélibia', 'Korba', 'Menzel Bouzelfa', 'Menzel Temime', 'Nabeul', 'Soliman', 'Takelsa',
  // Sfax
  'Agareb', 'Bir Ali Ben Khalifa', 'El Amra', 'El Hencha', 'Graïba', 'Jebiniana', 'Kerkennah', 'Mahrès', 'Menzel Chaker', 'Sakiet Eddaïer', 'Sakiet Ezzit', 'Sfax Sud', 'Sfax Ouest', 'Sfax Ville', 'Skhira', 'Thyna',
  // Sidi Bouzid
  'Bir El Hafey', 'Cebbala Ouled Asker', 'Essaïda', 'Hichria', 'Jilma', 'Meknassy', 'Menzel Bouzaiane', 'Mezzouna', 'Ouled Haffouz', 'Regueb', 'Sidi Ali Ben Aoun', 'Sidi Bouzid Est', 'Sidi Bouzid Ouest', 'Souk Jedid',
  // Siliana
  'Bargou', 'Bou Arada', 'El Aroussa', 'El Krib', 'Gaâfour', 'Kesra', 'Makthar', 'Rouhia', 'Sidi Bou Rouis', 'Siliana Nord', 'Siliana Sud',
  // Sousse
  'Akouda', 'Bouficha', 'Enfida', 'Hammam Sousse', 'Hergla', 'Kalâa Kebira', 'Kalâa Seghira', 'Kondar', "M'saken", 'Sidi Bou Ali', 'Sidi El Hani', 'Sousse Jawhara', 'Sousse Médina', 'Sousse Riadh', 'Sousse Sidi Abdelhamid', 'Zaouiet Ksibet Thrayet',
  // Tataouine
  'Beni Mhira', 'Bir Lahmar', 'Dehiba', 'Ghomrassen', 'Remada', 'Smâr', 'Tataouine Nord', 'Tataouine Sud',
  // Tozeur
  'Degache', 'El Hamma du Jérid', 'Hazoua', 'Nefta', 'Tameghza', 'Tozeur',
  // Tunis
  'Bab El Bhar', 'Bab Souika', 'Carthage', 'Cité El Khadra', 'Djebel Jelloud', 'El Kabaria', 'El Menzah', 'El Omrane', 'El Omrane supérieur', 'El Ouardia', 'Ettahrir', 'Ezzouhour', 'Hraïria', 'La Goulette', 'La Marsa', 'Le Bardo', 'Le Kram', 'Médina', 'Séjoumi', 'Sidi El Béchir', 'Sidi Hassine',
  // Zaghouan
  'Bir Mcherga', 'El Fahs', 'Nadhour', 'Saouaf', 'Zaghouan', 'Zriba'
];

// ========== قائمة الماركات (مع خيار Autre) ==========
const carBrandsList = [
  'Abarth', 'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Buick',
  'BYD', 'Cadillac', 'Chery', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Dacia', 'Daewoo',
  'Daihatsu', 'Dodge', 'DS Automobiles', 'Ferrari', 'Fiat', 'Ford', 'Geely', 'Genesis', 'GMC',
  'Great Wall', 'Honda', 'Hyundai', 'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini',
  'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz',
  'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche', 'Renault', 'Rolls-Royce',
  'Seat', 'Skoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki', 'Tata', 'Tesla', 'Toyota',
  'Volkswagen', 'Volvo', 'Autre'
];

// ========== قائمة خيارات السيارة الكاملة ==========
const allFeatures = [
  'GPS', 'Bluetooth', 'Caméra de recul', 'Radar de stationnement', 
  'Climatisation', 'Régulateur de vitesse', 'Sièges chauffants', 
  'Toit ouvrant', 'USB', 'Apple CarPlay', 'Android Auto', 'Start & Stop',
  'Vitres électriques', 'Rétroviseurs électriques', 'Direction assistée',
  'ABS', 'Airbags', 'Allumage automatique des phares', 'Essuie-glaces automatiques'
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

  // حساب نسبة التقدم
  const getProgressPercentage = () => {
    return Math.round((step / 15) * 100);
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
    
    if (step === 14 && formData.pricePerDay < 20) {
      const confirm = window.confirm('Le prix semble très bas (moins de 20 TND/jour). Voulez-vous continuer ?');
      if (!confirm) return;
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
        'parkingType', 'address', 'city', 'delegation', 'deliveryMethod', 'pricePerDay'
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
        'doors', 'seats', 'caution'
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

  // ========== RENDER STEP 1 (avec Autre) ==========
  const renderStep1 = () => {
    const tunisianCities = [
      'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
      'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'Manouba', 'Médenine',
      'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
      'Tozeur', 'Tunis', 'Zaghouan'
    ];

    // التحقق إذا كانت الماركة من النوع "Autre" (ليست في القائمة)
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
          {!isCustomBrand && !isAutreSelected && (
            <small className="form-hint">Vous pouvez aussi sélectionner "Autre" pour saisir une marque personnalisée</small>
          )}
          {(isCustomBrand || isAutreSelected) && (
            <small className="form-hint">Entrez la marque exacte de votre véhicule</small>
          )}
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
          <select name="delegation" value={formData.delegation} onChange={handleChange} required>
            <option value="">Sélectionner une délégation</option>
            {delegationsList.map(delegation => (
              <option key={delegation} value={delegation}>{delegation}</option>
            ))}
          </select>
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

  // ========== RENDER STEP 7 ==========
  const renderStep7 = () => (
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

  // ========== RENDER STEP 8 ==========
  const renderStep8 = () => {
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

  // ========== RENDER STEP 9 ==========
  const renderStep9 = () => (
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

  // ========== RENDER STEP 10 ==========
  const renderStep10 = () => (
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

  // ========== RENDER STEP 11 ==========
  const renderStep11 = () => (
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

  // ========== RENDER STEP 12 ==========
  const renderStep12 = () => {
    const tunisianCities = [
      'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
      'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'Manouba', 'Médenine',
      'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
      'Tozeur', 'Tunis', 'Zaghouan'
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
          <select name="delegation" value={formData.delegation} onChange={handleChange} required>
            <option value="">Sélectionner une délégation</option>
            {delegationsList.map(delegation => (
              <option key={delegation} value={delegation}>{delegation}</option>
            ))}
          </select>
        </div>
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button onClick={handleNext} className="step-button">Suivant</button>
        </div>
      </div>
    );
  };

  // ========== RENDER STEP 13 ==========
  const renderStep13 = () => {
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

  // ========== RENDER STEP 14 (Prix simplifié) ==========
  const renderStep14 = () => {
    return (
      <div className="wizard-step">
        <h2>💰 Définissez vos tarifs</h2>
        
        <div className="form-group">
          <label>💰 Prix par jour (TND) *</label>
          <input 
            type="number" 
            name="pricePerDay" 
            value={formData.pricePerDay || 0} 
            onChange={handleChange} 
            placeholder="Ex: 80" 
            min="0"
            step="1"
            required
          />
          <small className="form-hint">Vous pouvez modifier ce prix à tout moment</small>
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
            <input 
              type="number" 
              name="caution" 
              value={formData.caution || 500} 
              onChange={handleChange} 
              placeholder="Ex: 500" 
              min="0"
              step="50"
            />
            <small className="form-hint">Recommandé: 500 à 1000 TND selon la voiture</small>
          </div>
        </div>
        
        <div className="info-box">
          <h4>📊 Calcul de vos gains</h4>
          <p>💰 <strong>Prix par jour:</strong> {formData.pricePerDay || 0} TND/jour</p>
          <p>💸 <strong>Commission plateforme (5%):</strong> -{((formData.pricePerDay || 0) * 0.05).toFixed(2)} TND/jour</p>
          <p>✨ <strong>Vos gains nets par jour:</strong> {((formData.pricePerDay || 0) * 0.95).toFixed(2)} TND</p>
          <p>🔒 <strong>Caution:</strong> {formData.caution || 500} TND (versée en espèces)</p>
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

  // ========== RENDER STEP 15 (Photos amélioré) ==========
  const renderStep15 = () => {
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
      case 7: return renderStep7();
      case 8: return renderStep8();
      case 9: return renderStep9();
      case 10: return renderStep10();
      case 11: return renderStep11();
      case 12: return renderStep12();
      case 13: return renderStep13();
      case 14: return renderStep14();
      case 15: return renderStep15();
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
          Étape {step} sur 15
        </div>
      </div>
      
      {saving && <div className="saving-indicator">💾 Sauvegarde en cours...</div>}
      
      <div className="wizard-progress">
        {[...Array(15)].map((_, i) => (
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