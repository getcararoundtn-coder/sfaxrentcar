import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import API from '../services/api';
import { showError } from '../utils/ToastConfig';
import LazyLoad from 'react-lazyload';
import ModalFilter from '../components/ModalFilter';
import './Cars.css';

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [ownerRatings, setOwnerRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // قراءة المعاملات من URL
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    delegation: searchParams.get('delegation') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    transmission: searchParams.get('transmission') || '',
    fuelType: searchParams.get('fuelType') || '',
    seats: searchParams.get('seats') || '',
    minRating: searchParams.get('minRating') || ''
  });

  // تحديث URL عند تغيير الفلاتر
  const updateURL = useCallback((newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        params.append(key, newFilters[key]);
      }
    });
    setSearchParams(params);
  }, [setSearchParams]);

  const fetchCars = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      const params = new URLSearchParams({
        page: pageNum,
        limit: pagination.limit
      });
      
      if (filters.city) params.append('city', filters.city);
      if (filters.delegation) params.append('delegation', filters.delegation);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.transmission) params.append('transmission', filters.transmission);
      if (filters.fuelType) params.append('fuelType', filters.fuelType);
      if (filters.seats) params.append('seats', filters.seats);
      
      const { data } = await API.get(`/cars?${params}`);
      
      const newCars = data.data;
      
      // جلب تقييمات المؤجرين للسيارات الجديدة
      const ratings = {};
      for (const car of newCars) {
        if (car.ownerId?._id) {
          try {
            const res = await API.get(`/users/${car.ownerId._id}/rating`);
            ratings[car.ownerId._id] = res.data.data;
          } catch (err) {
            ratings[car.ownerId._id] = { rating: 0, count: 0 };
          }
        }
      }
      
      if (append) {
        setCars(prev => [...prev, ...newCars]);
        setOwnerRatings(prev => ({ ...prev, ...ratings }));
      } else {
        setCars(newCars);
        setOwnerRatings(ratings);
      }
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching cars:', err);
      showError('حدث خطأ في تحميل السيارات');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    fetchCars(1, false);
  }, [filters, fetchCars]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    updateURL(newFilters);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      city: '', delegation: '', startDate: '', endDate: '', type: '',
      minPrice: '', maxPrice: '', transmission: '', fuelType: '', seats: '', minRating: ''
    };
    setFilters(emptyFilters);
    updateURL(emptyFilters);
    setShowFilterModal(false);
  };

  const loadMore = () => {
    if (pagination.hasNextPage) {
      fetchCars(pagination.page + 1, true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      );
    }
    return stars;
  };

  const locationText = filters.delegation ? `${filters.delegation}, ${filters.city}` : filters.city;

  return (
    <>
      <Navbar />
      <div className="cars-page">
        {/* معلومات البحث */}
        <div className="search-info">
          {locationText && <span className="search-location">{locationText}</span>}
          {filters.startDate && filters.endDate && (
            <span className="search-dates">
              {formatDate(filters.startDate)} → {formatDate(filters.endDate)}
            </span>
          )}
        </div>

        <div className="cars-container">
          {/* زر الفلاتر - يفتح Modal */}
          <button onClick={() => setShowFilterModal(true)} className="filter-toggle-btn">
            🔍 Filtres
          </button>

          {/* عدد النتائج */}
          <div className="results-header">
            <p className="results-count">{pagination.total} voitures disponibles</p>
            <p className="filter-hint">Utilisez le filtre pour trouver la voiture idéale.</p>
          </div>

          <div className="cars-layout">
            {/* عرض السيارات */}
            <main className="cars-grid">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Chargement des voitures...</p>
                </div>
              ) : cars.length === 0 ? (
                <div className="no-results">
                  <p>Aucune voiture trouvée</p>
                  <button onClick={clearFilters} className="reset-btn">Afficher toutes les voitures</button>
                </div>
              ) : (
                <>
                  {cars.map(car => {
                    const ownerRating = ownerRatings[car.ownerId?._id] || { rating: 0, count: 0 };
                    return (
                      <div key={car._id} className="car-card">
                        <LazyLoad height={180} offset={100} once>
                          <img 
                            src={car.images?.[0] || '/default-car.jpg'} 
                            alt={`${car.brand} ${car.model}`} 
                            className="car-image" 
                          />
                        </LazyLoad>
                        <div className="car-info">
                          <h3 className="car-title">{car.brand} {car.model}</h3>
                          <p className="car-price">{car.pricePerDay} DT / jour</p>
                          <div className="car-meta">
                            <div className="owner-rating">
                              <span className="stars">{renderStars(ownerRating.rating)}</span>
                              <span className="rating-value">{ownerRating.rating?.toFixed(1) || 'Nouveau'}</span>
                              <span className="review-count">({ownerRating.count || 0})</span>
                            </div>
                            <span className="car-location">📍 {car.delegation || car.city || car.location}</span>
                          </div>
                          <Link to={`/car/${car._id}`} className="car-details-btn">
                            Voir les détails
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {pagination.hasNextPage && (
                    <div className="load-more">
                      <button 
                        onClick={loadMore} 
                        disabled={loadingMore}
                        className="load-more-btn"
                      >
                        {loadingMore ? 'Chargement...' : 'Afficher plus'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Modal الفلاتر */}
      <ModalFilter
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onClear={clearFilters}
      />
      <Footer />
    </>
  );
};

export default Cars;