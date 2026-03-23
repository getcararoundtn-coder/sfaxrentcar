import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';
import './CarWizard.css';

const CarWizard = ({ initialData }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [insuranceFrontPreview, setInsuranceFrontPreview] = useState(null);
  const [insuranceBackPreview, setInsuranceBackPreview] = useState(null);
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
    carImages: [],
    insuranceFront: null,
    insuranceBack: null
  });

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

  const saveDraft = async (currentStep, newData) => {
    try {
      await API.post('/cars/wizard/save', {
        step: currentStep,
        data: newData
      });
    } catch (err) {
      console.error('Error saving draft:', err);
    }
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
      newValue = parseInt(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    saveDraft(step, { ...formData, [name]: newValue });
  };

  const handleNext = async () => {
    setLoading(true);
    await saveDraft(step + 1, formData);
    setStep(step + 1);
    setLoading(false);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const requiredFields = ['brand', 'model', 'year', 'mileage', 'licensePlate', 
        'registrationCountry', 'registrationYear', 'fuelType', 'transmission', 
        'parkingType', 'address', 'city', 'delegation', 'deliveryMethod', 'pricePerDay'];
      
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        showError(`الرجاء تعبئة جميع الحقول المطلوبة: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
      
      const formDataToSend = new FormData();
      
      const textFields = ['brand', 'model', 'year', 'mileage', 'licensePlate', 
        'registrationCountry', 'registrationYear', 'fuelType', 'transmission', 
        'parkingType', 'address', 'city', 'delegation', 'deliveryMethod', 
        'pricePerDay', 'userType', 'paymentPlan', 'ownerPhone', 'ownerPhoneCountry',
        'doors', 'seats'];
      
      textFields.forEach(field => {
        if (formData[field] !== undefined && formData[field] !== null && formData[field] !== '') {
          formDataToSend.append(field, formData[field]);
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
      
      if (formData.carImages && formData.carImages.length > 0) {
        formData.carImages.forEach((file) => {
          formDataToSend.append('images', file);
        });
      }
      
      if (formData.insuranceFront) {
        formDataToSend.append('insuranceFront', formData.insuranceFront);
      }
      if (formData.insuranceBack) {
        formDataToSend.append('insuranceBack', formData.insuranceBack);
      }
      
      console.log('Sending data...');
      const { data } = await API.post('/cars/wizard/complete', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (data.success) {
        showSuccess('✅ تم إضافة السيارة بنجاح!');
        navigate('/owner-cars?tab=cars');
      }
    } catch (err) {
      console.error('Error completing wizard:', err);
      const errorMessage = err.response?.data?.message || 'فشل إضافة السيارة. الرجاء التأكد من تعبئة جميع البيانات.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========== الخطوة 13 المعدلة مع راديو بوتن ==========
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
              />
              <span>🚚 Livraison au client</span>
            </div>
            <p>Vous livrez la voiture à l'adresse du client</p>
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

  // ========== باقي الخطوات (نفس الكود السابق) ==========
  const renderStep8 = () => {
    let selectedDay = '', selectedMonth = '', selectedYear = '';
    if (formData.ownerBirthDate && formData.ownerBirthDate.includes('-')) {
      const parts = formData.ownerBirthDate.split('-');
      selectedYear = parts[0] || '';
      selectedMonth = parts[1] || '';
      selectedDay = parts[2] || '';
    }

    const handleBirthDateChange = (type, value) => {
      let newDay = selectedDay, newMonth = selectedMonth, newYear = selectedYear;
      if (type === 'day') newDay = value;
      if (type === 'month') newMonth = value;
      if (type === 'year') newYear = value;
      
      if (newDay && newMonth && newYear) {
        const formattedDate = `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, ownerBirthDate: formattedDate }));
        saveDraft(step, { ...formData, ownerBirthDate: formattedDate });
      } else {
        setFormData(prev => ({ ...prev, ownerBirthDate: '' }));
      }
    };

    const days = [];
    for (let i = 1; i <= 31; i++) days.push(i);
    
    const months = [
      { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
      { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
      { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
      { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
      { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
      { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }
    ];
    
    const years = [];
    for (let i = 2025; i >= 1900; i--) years.push(i);

    return (
      <div className="wizard-step">
        <h2>Quelle est votre date de naissance ?</h2>
        <div className="birthdate-group">
          <div className="birthdate-select">
            <label>Jour</label>
            <select onChange={(e) => handleBirthDateChange('day', e.target.value)} value={selectedDay}>
              <option value="">Jour</option>
              {days.map(day => (
                <option key={day} value={String(day).padStart(2, '0')}>{day}</option>
              ))}
            </select>
          </div>
          <div className="birthdate-select">
            <label>Mois</label>
            <select onChange={(e) => handleBirthDateChange('month', e.target.value)} value={selectedMonth}>
              <option value="">Mois</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          <div className="birthdate-select">
            <label>Année</label>
            <select onChange={(e) => handleBirthDateChange('year', e.target.value)} value={selectedYear}>
              <option value="">Année</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="step-note">nous devons vous demander cette information pour des raisons légales</p>
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button onClick={handleNext} className="step-button">Suivant</button>
        </div>
      </div>
    );
  };

  const renderStep15 = () => {
    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
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
    
    return (
      <div className="wizard-step">
        <h2>Ajoutez des photos de votre voiture</h2>
        <p className="step-note">Ajoutez au moins 3 photos pour que votre annonce soit plus attractive</p>
        
        <div className="form-group">
          <label>📸 Photos de la voiture (max 5)</label>
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
          <label>📄 Carte grise (recto)</label>
          <input type="file" accept="image/*" onChange={handleInsuranceFrontUpload} />
          {insuranceFrontPreview && (
            <img src={insuranceFrontPreview} alt="Carte grise recto" className="preview-thumb" />
          )}
        </div>
        
        <div className="form-group">
          <label>📄 Carte grise (verso)</label>
          <input type="file" accept="image/*" onChange={handleInsuranceBackUpload} />
          {insuranceBackPreview && (
            <img src={insuranceBackPreview} alt="Carte grise verso" className="preview-thumb" />
          )}
        </div>
        
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button onClick={handleComplete} className="step-button" disabled={loading}>
            {loading ? 'Confirmation...' : 'Confirmer et publier'}
          </button>
        </div>
      </div>
    );
  };

  // الخطوة 1-7, 9-12, 14 (نفس الكود السابق - أضفها هنا)
  const renderStep1 = () => (
    <div className="wizard-step">
      <h2>Confirmez le modèle de votre voiture</h2>
      <div className="form-group">
        <label>Marque</label>
        <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Ex: Renault, Peugeot..." />
      </div>
      <div className="form-group">
        <label>Modèle</label>
        <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="Ex: Clio, 208..." />
      </div>
      <div className="form-group">
        <label>Année</label>
        <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="2020" />
      </div>
      <div className="form-group">
        <label>Kilométrage</label>
        <select name="mileage" value={formData.mileage} onChange={handleChange}>
          <option value="">Sélectionner</option>
          <option value="0-15000">0-15000 km</option>
          <option value="15000-50000">15000-50000 km</option>
          <option value="50000-100000">50000-100000 km</option>
          <option value="100000-150000">100000-150000 km</option>
          <option value="150000-200000">150000-200000 km</option>
          <option value="200000+">200000+ km</option>
        </select>
      </div>
      <p className="step-note">dans quelques minutes, votre annonce sera mise en ligne</p>
      <button onClick={handleNext} className="step-button">Confirmer</button>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-step">
      <h2>Inscrire ma voiture</h2>
      <p>quelle est l'immatriculation ?</p>
      <div className="form-group">
        <label>Plaque d'immatriculation</label>
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
        <label>Année d'immatriculation</label>
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

  const renderStep4 = () => (
    <div className="wizard-step">
      <h2>Ajouter plus de détails</h2>
      <div className="form-group">
        <label>Carburant</label>
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
        <label>Boîte de vitesse</label>
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

  const renderStep6 = () => (
    <div className="wizard-step">
      <h2>Rendre votre annonce unique</h2>
      <div className="features-grid">
        {['GPS', 'Bluetooth', 'Climatisation', 'Caméra recul'].map(feature => (
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
          <label>Adresse</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Rue, numéro, bâtiment..." />
        </div>
        <div className="form-group">
          <label>Ville / Gouvernorat</label>
          <select name="city" value={formData.city} onChange={handleChange}>
            <option value="">Sélectionner une ville</option>
            {tunisianCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Délégation</label>
          <input type="text" name="delegation" value={formData.delegation} onChange={handleChange} placeholder="Délégation / Secteur" />
        </div>
        <div className="step-buttons">
          <button onClick={handlePrev} className="step-button secondary">Précédent</button>
          <button onClick={handleNext} className="step-button">Suivant</button>
        </div>
      </div>
    );
  };

  const renderStep14 = () => (
    <div className="wizard-step">
      <h2>Comment fonctionnent vos gains ?</h2>
      <div className="form-group">
        <label>Prix par jour (TND)</label>
        <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} placeholder="Ex: 80" min="0" />
      </div>
      <div className="info-box">
        <p>💰 Vous définissez un prix par jour</p>
        <p>📊 Nous calculons le prix de réservation</p>
        <p>💸 Nous déduisons 5% de frais de service</p>
        <p>⚡ Vous êtes indemnisés des frais additionnels (essence manquante, pénalités)</p>
      </div>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Suivant</button>
      </div>
    </div>
  );

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