import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import API from '../services/api';
import { showError } from '../utils/ToastConfig';
import LazyLoad from 'react-lazyload';
import ModalFilter from '../components/ModalFilter';
import './Cars.css';

// ✅ CarCard component with React.memo for performance
const CarCard = React.memo(({ car, ownerRating, renderStars }) => {
  // Optimize image URL with thumbnail size
  const imageUrl = car.images?.[0] 
    ? `${car.images[0]}?w=300&h=200&fit=crop` 
    : '/default-car.jpg';
  
  return (
    <Link to={`/car/${car._id}`} className="car-card-link" prefetch="intent">
      <div className="car-card">
        <LazyLoad height={200} offset={100} once>
          <div className="car-image-container">
            <img 
              src={imageUrl}
              alt={`${car.brand} ${car.model}`} 
              className="car-image" 
              loading="lazy"
            />
            {car.isFeatured && <span className="featured-badge">⭐ Mis en avant</span>}
          </div>
        </LazyLoad>
        <div className="car-info">
          <div className="car-header">
            <h3 className="car-title">{car.brand} {car.model}</h3>
            <span className="car-year">{car.year}</span>
          </div>
          <p className="car-price">
            <span className="price">{car.pricePerDay} DT</span>
            <span className="per-day">/ jour</span>
          </p>
          <div className="car-meta">
            <div className="owner-rating">
              <span className="stars">{renderStars(ownerRating.rating)}</span>
              <span className="rating-value">{ownerRating.rating?.toFixed(1) || 'Nouveau'}</span>
              <span className="review-count">({ownerRating.count || 0})</span>
            </div>
            <span className="car-location">
              📍 {car.delegation || car.city || car.location}
            </span>
          </div>
          <div className="car-specs-mini">
            <span>⚙️ {car.transmission === 'Manuelle' ? 'Manuelle' : 'Auto'}</span>
            <span>⛽ {car.fuelType}</span>
            <span>👥 {car.seats || 5} places</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [ownerRatings, setOwnerRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

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
        limit: pagination.limit,
        sort: sortBy
      });
      
      if (filters.city) params.append('city', filters.city);
      if (filters.delegation) params.append('delegation', filters.delegation);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.transmission) params.append('transmission', filters.transmission);
      if (filters.fuelType) params.append('fuelType', filters.fuelType);
      if (filters.seats) params.append('seats', filters.seats);
      if (filters.minRating) params.append('minRating', filters.minRating);
      
      const { data } = await API.get(`/cars?${params}`);
      
      const newCars = data.data;
      
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
  }, [filters, pagination.limit, sortBy]);

  useEffect(() => {
    fetchCars(1, false);
  }, [filters, sortBy, fetchCars]);

  // ✅ Preload car detail pages on hover
  useEffect(() => {
    const preloadLinks = () => {
      const links = document.querySelectorAll('.car-card-link');
      links.forEach(link => {
        link.addEventListener('mouseenter', () => {
          const href = link.getAttribute('href');
          if (href) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'prefetch';
            preloadLink.href = href;
            document.head.appendChild(preloadLink);
          }
        });
      });
    };
    
    preloadLinks();
  }, [cars]);

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

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">½</span>);
      } else {
        stars.push(<span key={i} className="star">☆</span>);
      }
    }
    return stars;
  }, []);

  const locationText = filters.delegation ? `${filters.delegation}, ${filters.city}` : filters.city;
  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

  return (
    <>
      <Navbar />
      <div className="cars-page">
        {(locationText || (filters.startDate && filters.endDate)) && (
          <div className="search-info">
            {locationText && <span className="search-location">📍 {locationText}</span>}
            {filters.startDate && filters.endDate && (
              <span className="search-dates">
                📅 {formatDate(filters.startDate)} → {formatDate(filters.endDate)}
              </span>
            )}
            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters-btn">
                ✖ Effacer les filtres
              </button>
            )}
          </div>
        )}

        <div className="cars-container">
          <div className="toolbar">
            <button onClick={() => setShowFilterModal(true)} className="filter-toggle-btn">
              🔍 Filtres
              {hasActiveFilters && <span className="filter-badge">●</span>}
            </button>
            
            <div className="sort-section">
              <label className="sort-label">Trier par :</label>
              <select value={sortBy} onChange={handleSortChange} className="sort-select">
                <option value="recent">Plus récent</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="rating">Mieux noté</option>
              </select>
            </div>
          </div>

          <div className="results-header">
            <p className="results-count">
              {pagination.total} {pagination.total === 1 ? 'voiture disponible' : 'voitures disponibles'}
            </p>
            {hasActiveFilters && (
              <p className="filter-active">
                Filtres actifs : {Object.values(filters).filter(v => v).length} filtre(s)
              </p>
            )}
          </div>

          <div className="cars-layout">
            <main className="cars-grid">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Chargement des voitures...</p>
                </div>
              ) : cars.length === 0 ? (
                <div className="no-results">
                  <div className="no-results-icon">😕</div>
                  <p className="no-results-title">Aucune voiture trouvée</p>
                  <p className="no-results-text">
                    Essayez de modifier vos critères de recherche<br />
                    ou soyez le premier à ajouter une voiture dans cette région
                  </p>
                  <Link to="/rent-your-car" className="add-car-btn">
                    ➕ Ajouter ma voiture
                  </Link>
                  <button onClick={clearFilters} className="reset-btn">
                    Afficher toutes les voitures
                  </button>
                </div>
              ) : (
                <>
                  {cars.map(car => {
                    const ownerRating = ownerRatings[car.ownerId?._id] || { rating: 0, count: 0 };
                    return (
                      <CarCard 
                        key={car._id} 
                        car={car} 
                        ownerRating={ownerRating} 
                        renderStars={renderStars} 
                      />
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