import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import API from '../services/api';
import { showError } from '../utils/ToastConfig';
import LazyLoad from 'react-lazyload';
import './Cars.css';

const Cars = () => {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    year: searchParams.get('year') || '',
    location: searchParams.get('location') || '',
    minPrice: '',
    maxPrice: '',
    fuelType: '',
    seats: ''
  });

  const fetchCarsWithDates = useCallback(async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      if (pageNum > 1) setLoadingMore(true);
      
      const params = new URLSearchParams({
        page: pageNum,
        limit: pagination.limit
      });
      
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      
      const { data } = await API.get(`/cars?${params}`);
      setCars(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching cars:', err);
      showError('حدث خطأ في تحميل السيارات');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [startDate, endDate, pagination.limit]);

  useEffect(() => {
    fetchCarsWithDates(1);
  }, [fetchCarsWithDates]);

  useEffect(() => {
    let filtered = [...cars];

    if (filters.q) {
      filtered = filtered.filter(car => 
        car.brand.toLowerCase().includes(filters.q.toLowerCase()) ||
        car.model.toLowerCase().includes(filters.q.toLowerCase())
      );
    }

    if (filters.year) {
      filtered = filtered.filter(car => 
        car.year.toString() === filters.year
      );
    }

    if (filters.location) {
      filtered = filtered.filter(car => 
        car.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(car => car.pricePerDay >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(car => car.pricePerDay <= Number(filters.maxPrice));
    }

    if (filters.fuelType) {
      filtered = filtered.filter(car => car.fuelType === filters.fuelType);
    }

    if (filters.seats) {
      filtered = filtered.filter(car => car.seats >= Number(filters.seats));
    }

    setFilteredCars(filtered);
  }, [cars, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      year: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      fuelType: '',
      seats: ''
    });
  };

  const fuelTypes = [
    { value: '', label: 'كل الأنواع' },
    { value: 'petrol', label: 'بنزين' },
    { value: 'diesel', label: 'ديزل' },
    { value: 'electric', label: 'كهرباء' },
    { value: 'hybrid', label: 'هايبرد' }
  ];

  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

  return (
    <>
      <Navbar />
      <div className="cars-page-container">
        <h1 className="cars-page-title">السيارات المتاحة</h1>

        <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle">
          {showFilters ? '🔍 إخفاء البحث المتقدم' : '🔍 بحث متقدم'}
        </button>

        {showFilters && (
          <div className="filters-section">
            <h3 className="filters-title">بحث متقدم</h3>
            <div className="filters-grid">
              <input
                type="text"
                name="q"
                placeholder="ابحث باسم السيارة"
                value={filters.q}
                onChange={handleFilterChange}
                className="filter-input"
              />
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">كل السنوات</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input
                type="text"
                name="location"
                placeholder="المكان"
                value={filters.location}
                onChange={handleFilterChange}
                className="filter-input"
              />
              <input
                type="number"
                name="minPrice"
                placeholder="أقل سعر"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="filter-input"
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="أعلى سعر"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="filter-input"
              />
              <select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {fuelTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <input
                type="number"
                name="seats"
                placeholder="عدد المقاعد"
                value={filters.seats}
                onChange={handleFilterChange}
                className="filter-input"
              />
              <button onClick={clearFilters} className="clear-filters-button">
                مسح الكل
              </button>
            </div>
          </div>
        )}

        <button onClick={() => setShowDateFilter(!showDateFilter)} className="date-filter-toggle">
          {showDateFilter ? '🔍 إخفاء التحقق من التوفر' : '🔍 التحقق من توفر السيارة بتواريخ محددة'}
        </button>

        {showDateFilter && (
          <div className="date-filter-section">
            <h3 className="date-filter-title">تحقق من توفر السيارة</h3>
            <div className="date-filter-grid">
              <div className="date-filter-group">
                <label>تاريخ البداية</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="date-filter-input"
                />
              </div>
              <div className="date-filter-group">
                <label>تاريخ النهاية</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="date-filter-input"
                />
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }} 
                  className="clear-dates-button"
                >
                  مسح التواريخ
                </button>
              )}
            </div>
            {startDate && endDate && (
              <p className="date-filter-info">
                عرض السيارات المتاحة من {new Date(startDate).toLocaleDateString('ar-TN')} إلى {new Date(endDate).toLocaleDateString('ar-TN')}
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>جاري تحميل السيارات...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="no-results">
            <p>لا توجد سيارات تطابق بحثك</p>
            <button onClick={clearFilters} className="reset-button">
              عرض جميع السيارات
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">تم العثور على {filteredCars.length} سيارة</p>
            <div className="cars-grid">
              {filteredCars.map(car => (
                <div key={car._id} className="car-card">
                  <LazyLoad height={180} offset={100} once>
                    <img 
                      src={car.images?.[0] || '/default-car.jpg'} 
                      alt={car.brand} 
                      className="car-image" 
                    />
                  </LazyLoad>
                  <div className="car-info">
                    <h3 className="car-title">{car.brand} {car.model} ({car.year})</h3>
                    <p className="car-price">{car.pricePerDay} دينار / يوم</p>
                    <p className="car-location">📍 {car.location || 'تونس'}</p>
                    <div className="car-rating">
                      <span>⭐ {car.averageRating || 4.5}</span>
                      <span>({car.reviewsCount || 0} تقييم)</span>
                    </div>
                    <Link to={`/car/${car._id}`} className="car-button">
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {pagination.hasNextPage && (
              <div className="load-more-container">
                <button 
                  onClick={() => fetchCarsWithDates(pagination.page + 1)}
                  className="load-more-button"
                  disabled={loadingMore}
                >
                  {loadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cars;