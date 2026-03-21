import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import API from '../services/api';
import { showError } from '../utils/ToastConfig';
import LazyLoad from 'react-lazyload';
import './Cars.css';

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
      
      if (append) {
        setCars(prev => [...prev, ...data.data]);
      } else {
        setCars(data.data);
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

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      city: '', delegation: '', startDate: '', endDate: '', type: '',
      minPrice: '', maxPrice: '', transmission: '', fuelType: '', seats: '', minRating: ''
    };
    setFilters(emptyFilters);
    updateURL(emptyFilters);
    setShowFilters(false);
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
          {/* زر الفلاتر */}
          <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle-btn">
            {showFilters ? '✕ Fermer les filtres' : '🔍 Filtres'}
          </button>

          {/* عدد النتائج */}
          <div className="results-header">
            <p className="results-count">{pagination.total} voitures disponibles</p>
            <p className="filter-hint">Utilisez le filtre pour trouver la voiture idéale.</p>
          </div>

          <div className="cars-layout">
            {/* الفلاتر الجانبية */}
            {showFilters && (
              <aside className="filters-sidebar">
                <div className="filter-group">
                  <h4>Prix</h4>
                  <div className="price-range">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="filter-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Type de voiture</h4>
                  {['Citadine', 'Utilitaire', 'SUV', 'Familiale', 'Luxe', 'Économique'].map(type => (
                    <label key={type} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filters.type === type}
                        onChange={() => handleFilterChange('type', filters.type === type ? '' : type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h4>Nombre de places</h4>
                  <div className="seat-options">
                    {[2, 4, 5, 7].map(seat => (
                      <button
                        key={seat}
                        onClick={() => handleFilterChange('seats', filters.seats === seat.toString() ? '' : seat.toString())}
                        className={`seat-btn ${filters.seats === seat.toString() ? 'active' : ''}`}
                      >
                        {seat}+
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Boîte de vitesses</h4>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="transmission"
                        value="manual"
                        checked={filters.transmission === 'manual'}
                        onChange={(e) => handleFilterChange('transmission', e.target.value)}
                      />
                      Manuelle
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="transmission"
                        value="automatic"
                        checked={filters.transmission === 'automatic'}
                        onChange={(e) => handleFilterChange('transmission', e.target.value)}
                      />
                      Automatique
                    </label>
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Carburant</h4>
                  <select
                    value={filters.fuelType}
                    onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Tous</option>
                    <option value="petrol">Essence</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Électrique</option>
                    <option value="hybrid">Hybride</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.minRating === '4'}
                      onChange={() => handleFilterChange('minRating', filters.minRating === '4' ? '' : '4')}
                    />
                    Taux d’acceptation supérieur à 30%
                  </label>
                </div>

                <button onClick={clearFilters} className="clear-filters-btn">
                  Réinitialiser les filtres
                </button>
              </aside>
            )}

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
                  {cars.map(car => (
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
                          <span className="car-rating">⭐ {car.averageRating || 4.5}</span>
                          <span className="car-location">📍 {car.delegation || car.city || car.location}</span>
                        </div>
                        <Link to={`/car/${car._id}`} className="car-details-btn">
                          Voir les détails
                        </Link>
                      </div>
                    </div>
                  ))}

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
      <Footer />
    </>
  );
};

export default Cars;