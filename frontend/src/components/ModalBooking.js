import React, { useState } from 'react';
import Modal from './Modal';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';

const ModalBooking = ({ isOpen, onClose, car, startDate, endDate, totalPrice, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/bookings', {
        carId: car._id,
        startDate,
        endDate,
        totalPrice
      });

      if (response.data.success) {
        showSuccess('✅ تم إنشاء الحجز بنجاح');
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err.response?.data?.message || 'فشل إنشاء الحجز';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la réservation" size="small">
      <div className="modal-booking">
        <div className="booking-car-info">
          <h3>{car?.brand} {car?.model} ({car?.year})</h3>
          <p className="booking-car-location">📍 {car?.delegation}, {car?.city}</p>
        </div>

        <div className="booking-dates">
          <div className="date-item">
            <span className="date-label">Date de début</span>
            <span className="date-value">{formatDate(startDate)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">Date de fin</span>
            <span className="date-value">{formatDate(endDate)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">Durée</span>
            <span className="date-value">{days} jour{days > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="booking-price">
          <div className="price-item">
            <span>{car?.pricePerDay} DT × {days} jours</span>
            <span>{car?.pricePerDay * days} DT</span>
          </div>
          {/* ✅ تم إزالة قسم رسوم الخدمة (Frais de service) */}
          <div className="price-item total">
            <span>Total</span>
            <span>{totalPrice.toFixed(2)} DT</span>
          </div>
        </div>

        {error && <div className="booking-error">{error}</div>}

        <div className="booking-actions">
          <button onClick={onClose} className="cancel-booking-btn">
            Annuler
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={loading}
            className="confirm-booking-btn"
          >
            {loading ? 'Traitement...' : 'Confirmer la réservation'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalBooking;