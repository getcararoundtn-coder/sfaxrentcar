import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';
import './CarWizard.css';

const CarWizard = ({ initialData }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // الخطوة 1: معلومات أساسية
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || '',
    mileage: initialData?.mileage || '',
    
    // الخطوة 2: لوحة السيارة
    licensePlate: '',
    registrationCountry: 'Tunisie',
    registrationYear: '',
    
    // الخطوة 3: الكيلومترات (تم حفظه في الخطوة 1)
    
    // الخطوة 4: تفاصيل إضافية
    fuelType: '',
    transmission: '',
    
    // الخطوة 5: المقاعد والأبواب
    doors: 4,
    seats: 5,
    
    // الخطوة 6: المعدات
    features: [],
    
    // الخطوة 7: نوع المستخدم
    userType: 'particulier',
    
    // الخطوة 8: تاريخ الميلاد
    ownerBirthDate: '',
    
    // الخطوة 9: خطة الدفع
    paymentPlan: 'hebdomadaire',
    
    // الخطوة 10: رقم الهاتف
    ownerPhone: '',
    ownerPhoneCountry: 'Tunisie',
    
    // الخطوة 11: مكان ركن السيارة
    parkingType: '',
    
    // الخطوة 12: العنوان
    address: '',
    city: '',
    delegation: '',
    
    // الخطوة 13: طريقة التسليم
    deliveryMethod: '',
    
    // الخطوة 14: السعر (سيتم تعيينه لاحقاً)
    pricePerDay: 0
  });

  // تحميل المسودة المحفوظة
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

  // حفظ المسودة عند تغيير البيانات
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
      return;
    }
    
    if (type === 'number') {
      newValue = parseInt(value);
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
      const { data } = await API.post('/cars/wizard/complete');
      if (data.success) {
        showSuccess('✅ تم إضافة السيارة بنجاح!');
        navigate('/owner-cars');
      }
    } catch (err) {
      console.error('Error completing wizard:', err);
      showError(err.response?.data?.message || 'فشل إضافة السيارة');
    } finally {
      setLoading(false);
    }
  };

  // دالة عرض الخطوات
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
      default: return null;
    }
  };

  // الخطوة 1: Confirmez le modèle
  const renderStep1 = () => (
    <div className="wizard-step">
      <h2>Confirmez le modèle de votre voiture</h2>
      <div className="form-group">
        <label>Type</label>
        <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Marque" />
      </div>
      <div className="form-group">
        <label>Modèle</label>
        <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="Modèle" />
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

  // الخطوة 2: Inscrire ma voiture (plaque d'immatriculation)
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

  // الخطوة 3: Confirmez le kilométrage
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

  // الخطوة 4: Ajouter plus de détails (Carburant, Boîte)
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

  // الخطوة 5: Nombre de portes et sièges
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

  // الخطوة 6: Équipements
  const renderStep6 = () => (
    <div className="wizard-step">
      <h2>Rendre votre annonce unique</h2>
      <div className="features-grid">
        <label className={`feature-item ${formData.features.includes('GPS') ? 'active' : ''}`}>
          <input type="checkbox" name="GPS" checked={formData.features.includes('GPS')} onChange={handleChange} />
          <span>GPS</span>
        </label>
        <label className={`feature-item ${formData.features.includes('Bluetooth') ? 'active' : ''}`}>
          <input type="checkbox" name="Bluetooth" checked={formData.features.includes('Bluetooth')} onChange={handleChange} />
          <span>Bluetooth</span>
        </label>
        <label className={`feature-item ${formData.features.includes('Climatisation') ? 'active' : ''}`}>
          <input type="checkbox" name="Climatisation" checked={formData.features.includes('Climatisation')} onChange={handleChange} />
          <span>Climatisation</span>
        </label>
        <label className={`feature-item ${formData.features.includes('Caméra recul') ? 'active' : ''}`}>
          <input type="checkbox" name="Caméra recul" checked={formData.features.includes('Caméra recul')} onChange={handleChange} />
          <span>Caméra recul</span>
        </label>
      </div>
      <div className="step-buttons">
        <button onClick={handlePrev} className="step-button secondary">Précédent</button>
        <button onClick={handleNext} className="step-button">Suivant</button>
      </div>
    </div>
  );

  // الخطوة 7: Particulier ou Professionnel
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

  // باقي الخطوات ستضاف لاحقاً (8-14)

  return (
    <div className="wizard-container">
      <div className="wizard-progress">
        {[...Array(14)].map((_, i) => (
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