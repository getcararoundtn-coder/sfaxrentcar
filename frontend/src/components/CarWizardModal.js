import React from 'react';
import CarWizard from './CarWizard';
import './CarWizardModal.css';

const CarWizardModal = ({ isOpen, onClose, initialData }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="wizard-modal-overlay" onClick={handleClose}>
      <div className="wizard-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="wizard-modal-close" onClick={handleClose}>
          ✕
        </button>
        <CarWizard initialData={initialData} onComplete={handleClose} />
      </div>
    </div>
  );
};

export default CarWizardModal;