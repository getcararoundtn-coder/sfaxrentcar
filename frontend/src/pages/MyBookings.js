import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';
import { showError } from '../utils/ToastConfig';  // ✅ فقط showError
import './MyBookings.css';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my-bookings');
      setBookings(data.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showError('فشل تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': 
        return { bg: '#fff3cd', color: '#856404', text: 'En attente' };
      case 'accepted': 
        return { bg: '#d4edda', color: '#155724', text: 'Confirmé ✅' };
      case 'refused': 
        return { bg: '#f8d7da', color: '#721c24', text: 'Refusé ❌' };
      case 'completed': 
        return { bg: '#cce5ff', color: '#004085', text: 'Terminé' };
      case 'cancelled': 
        return { bg: '#e2e3e5', color: '#383d41', text: 'Annulé' };
      default: 
        return { bg: '#e2e3e5', color: '#383d41', text: status };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const goToMessages = (bookingId) => {
    navigate(`/messages/${bookingId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="my-bookings-container">
        <h1 className="my-bookings-title">Mes réservations</h1>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>Vous n'avez pas encore de réservations</p>
            <Link to="/cars" className="browse-link">Parcourir les voitures</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => {
              const status = getStatusColor(booking.status);
              const days = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
              const canChat = booking.status === 'accepted' || booking.status === 'completed' || booking.status === 'ongoing';
              
              return (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.carId?.brand} {booking.carId?.model} ({booking.carId?.year})</h3>
                    <span className="status-badge" style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.text}
                    </span>
                  </div>
                  
                  <div className="booking-details">
                    <p><strong>Du:</strong> {formatDate(booking.startDate)}</p>
                    <p><strong>Au:</strong> {formatDate(booking.endDate)}</p>
                    <p><strong>Durée:</strong> {days} jours</p>
                    <p><strong>Prix total:</strong> {booking.totalPrice} TND</p>
                  </div>

                  <div className="booking-actions">
                    <Link to={`/car/${booking.carId?._id}`} className="view-car-button">
                      Voir la voiture
                    </Link>
                    
                    {canChat ? (
                      <button 
                        onClick={() => goToMessages(booking._id)}
                        className="message-button-primary"
                      >
                        💬 Messages
                      </button>
                    ) : booking.status === 'pending' ? (
                      <button className="message-button-disabled" disabled>
                        ⏳ En attente de confirmation
                      </button>
                    ) : null}
                  </div>
                  
                  {booking.status === 'accepted' && (
                    <div className="booking-chat-hint">
                      <span>💬</span>
                      <p>Votre réservation a été confirmée ! Vous pouvez maintenant contacter le propriétaire.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyBookings;