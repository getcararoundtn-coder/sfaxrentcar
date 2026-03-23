import React, { useState, useEffect } from 'react';
import Modal from './Modal';

// قائمة الولايات التونسية
const tunisianCities = [
  'Tunis', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte', 'Ariana', 'Ben Arous', 'Manouba',
  'Gabès', 'Gafsa', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Mahdia', 'Médenine',
  'Kébili', 'Tozeur', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Zaghouan', 'Monastir'
];

// المعتمديات حسب الولاية
const delegationsByCity = {
  'Tunis': ['Tunis Médina', 'Bab El Bhar', 'Bab Souika', 'Carthage', 'La Goulette', 'La Marsa', 'Le Bardo', 'Le Kram', 'Sidi Bou Said', 'El Omrane', 'Ettahrir', 'Ezzouhour', 'Séjoumi', 'Sidi Hassine'],
  'Sfax': ['Sfax Médina', 'Sfax Ouest', 'Sfax Sud', 'Sakiet Ezzit', 'Sakiet Eddaïer', 'Bir Ali Ben Khalifa', 'El Amra', 'El Hencha', 'Ghraiba', 'Jebiniana', 'Mahrès', 'Menzel Chaker', 'Thyna', 'Agareb', 'Skhira', 'Kerkennah'],
  'Sousse': ['Sousse Médina', 'Sousse Jawhara', 'Sousse Riadh', 'Sousse Sidi Abdelhamid', 'Akouda', 'Bouficha', 'Enfidha', 'Hammam Sousse', 'Hergla', 'Kalâa Kebira', 'Kalâa Seghira', "M'saken", 'Sidi Bou Ali', 'Sidi El Hani'],
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

const ModalFilter = ({ isOpen, onClose, filters, onApply, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [availableDelegations, setAvailableDelegations] = useState([]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // تحديث المعتمديات عند تغيير الولاية
  useEffect(() => {
    if (localFilters.city) {
      setAvailableDelegations(delegationsByCity[localFilters.city] || []);
      if (localFilters.delegation && !delegationsByCity[localFilters.city]?.includes(localFilters.delegation)) {
        setLocalFilters(prev => ({ ...prev, delegation: '' }));
      }
    } else {
      setAvailableDelegations([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters.city, localFilters.delegation]);

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters = {
      city: '', delegation: '', startDate: '', endDate: '', type: '',
      minPrice: '', maxPrice: '', transmission: '', fuelType: '', seats: '', minRating: ''
    };
    setLocalFilters(emptyFilters);
    onClear();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtres" size="medium">
      <div className="modal-filter">
        {/* Localisation */}
        <div className="filter-group">
          <h4>📍 Localisation</h4>
          <div className="location-filters">
            <select
              value={localFilters.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="filter-select"
            >
              <option value="">Ville / Gouvernorat</option>
              {tunisianCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            <select
              value={localFilters.delegation}
              onChange={(e) => handleChange('delegation', e.target.value)}
              className="filter-select"
              disabled={!localFilters.city}
            >
              <option value="">Délégation</option>
              {availableDelegations.map(delegation => (
                <option key={delegation} value={delegation}>{delegation}</option>
              ))}
            </select>
            {!localFilters.city && (
              <small className="filter-hint">Sélectionnez d'abord une ville</small>
            )}
          </div>
        </div>

        {/* Prix */}
        <div className="filter-group">
          <h4>💰 Prix</h4>
          <div className="price-range">
            <input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="filter-input"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        {/* Type de voiture - Boutons stylisés */}
        <div className="filter-group">
          <h4>🚗 Type de voiture</h4>
          <div className="car-type-buttons">
            {[
              { value: 'Citadine', icon: '🚗', label: 'Citadine' },
              { value: 'SUV', icon: '🚙', label: 'SUV' },
              { value: 'Berline', icon: '🚘', label: 'Berline' },
              { value: 'Utilitaire', icon: '🚚', label: 'Utilitaire' },
              { value: 'Luxe', icon: '💎', label: 'Luxe' },
              { value: 'Économique', icon: '💰', label: 'Économique' }
            ].map(type => (
              <button
                key={type.value}
                onClick={() => handleChange('type', localFilters.type === type.value ? '' : type.value)}
                className={`car-type-btn ${localFilters.type === type.value ? 'active' : ''}`}
              >
                <span className="car-type-icon">{type.icon}</span>
                <span className="car-type-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nombre de places */}
        <div className="filter-group">
          <h4>👥 Nombre de places</h4>
          <div className="seat-options">
            {[2, 4, 5, 7].map(seat => (
              <button
                key={seat}
                onClick={() => handleChange('seats', localFilters.seats === seat.toString() ? '' : seat.toString())}
                className={`seat-btn ${localFilters.seats === seat.toString() ? 'active' : ''}`}
              >
                {seat}+
              </button>
            ))}
          </div>
        </div>

        {/* Boîte de vitesses */}
        <div className="filter-group">
          <h4>⚙️ Boîte de vitesses</h4>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="transmission"
                value="Manuelle"
                checked={localFilters.transmission === 'Manuelle'}
                onChange={(e) => handleChange('transmission', e.target.value)}
              />
              <span>Manuelle</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="transmission"
                value="Automatique"
                checked={localFilters.transmission === 'Automatique'}
                onChange={(e) => handleChange('transmission', e.target.value)}
              />
              <span>Automatique</span>
            </label>
          </div>
        </div>

        {/* Carburant */}
        <div className="filter-group">
          <h4>⛽ Carburant</h4>
          <select
            value={localFilters.fuelType}
            onChange={(e) => handleChange('fuelType', e.target.value)}
            className="filter-select"
          >
            <option value="">Tous</option>
            <option value="Essence">Essence</option>
            <option value="Diesel">Diesel</option>
            <option value="Électrique">Électrique</option>
            <option value="Hybride">Hybride</option>
          </select>
        </div>

        {/* Note minimale */}
        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localFilters.minRating === '4'}
              onChange={() => handleChange('minRating', localFilters.minRating === '4' ? '' : '4')}
            />
            ⭐ Minimum 4 étoiles
          </label>
        </div>

        <div className="modal-filter-actions">
          <button onClick={handleClear} className="clear-filters-btn-modal">
            Réinitialiser
          </button>
          <button onClick={handleApply} className="apply-filters-btn">
            Appliquer
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalFilter;