import React, { useState, useContext } from 'react';
import Modal from './Modal';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { showSuccess, showError } from '../utils/ToastConfig';

const ModalSupport = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      showError('الرجاء تعبئة جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/support', {
        subject,
        message
      });

      if (response.data.success) {
        showSuccess('✅ تم إرسال رسالتك بنجاح، سيتم الرد عليك قريباً');
        setSubject('');
        setMessage('');
        onClose();
      }
    } catch (err) {
      console.error('Error sending support message:', err);
      showError(err.response?.data?.message || 'فشل إرسال الرسالة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contactez-nous" size="small">
      <form onSubmit={handleSubmit} className="support-form">
        <div className="form-group">
          <label>Votre nom</label>
          <input
            type="text"
            value={user?.name || ''}
            disabled
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Sujet *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Problème avec ma réservation"
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez votre problème ou votre demande..."
            rows={5}
            required
            className="form-textarea"
          />
        </div>
        
        <button type="submit" disabled={loading} className="support-submit">
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalSupport;