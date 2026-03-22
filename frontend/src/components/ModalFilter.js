import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const ModalFilter = ({ isOpen, onClose, filters, onApply, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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
        {/* Prix */}
        <div className="filter-group">
          <h4>Prix</h4>
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

        {/* Type de voiture */}
        <div className="filter-group">
          <h4>Type de voiture</h4>
          {['Citadine', 'Utilitaire', 'SUV', 'Familiale', 'Luxe', 'Économique'].map(type => (
            <label key={type} className="checkbox-label">
              <input
                type="checkbox"
                checked={localFilters.type === type}
                onChange={() => handleChange('type', localFilters.type === type ? '' : type)}
              />
              {type}
            </label>
          ))}
        </div>

        {/* Nombre de places */}
        <div className="filter-group">
          <h4>Nombre de places</h4>
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
          <h4>Boîte de vitesses</h4>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="transmission"
                value="manual"
                checked={localFilters.transmission === 'manual'}
                onChange={(e) => handleChange('transmission', e.target.value)}
              />
              Manuelle
            </label>
            <label>
              <input
                type="radio"
                name="transmission"
                value="automatic"
                checked={localFilters.transmission === 'automatic'}
                onChange={(e) => handleChange('transmission', e.target.value)}
              />
              Automatique
            </label>
          </div>
        </div>

        {/* Carburant */}
        <div className="filter-group">
          <h4>Carburant</h4>
          <select
            value={localFilters.fuelType}
            onChange={(e) => handleChange('fuelType', e.target.value)}
            className="filter-select"
          >
            <option value="">Tous</option>
            <option value="petrol">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Électrique</option>
            <option value="hybrid">Hybride</option>
          </select>
        </div>

        {/* Taux d'acceptation */}
        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localFilters.minRating === '4'}
              onChange={() => handleChange('minRating', localFilters.minRating === '4' ? '' : '4')}
            />
            Taux d’acceptation supérieur à 30%
          </label>
        </div>

        <div className="modal-filter-actions">
          <button onClick={handleClear} className="clear-filters-btn-modal">
            Réinitialiser
          </button>
          <button onClick={handleApply} className="apply-filters-btn">
            Appliquer les filtres
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalFilter;