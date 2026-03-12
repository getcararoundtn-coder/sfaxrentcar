// أنماط متجاوبة للاستخدام في جميع الصفحات
export const responsiveStyles = {
  // حاوية رئيسية متجاوبة
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    width: '100%'
  },

  // شبكة متجاوبة
  grid: (columns = 3) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '20px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr'
    }
  }),

  // أزرار متجاوبة
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    '@media (max-width: 480px)': {
      padding: '8px 16px',
      fontSize: '14px'
    }
  },

  // بطاقات متجاوبة
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '@media (max-width: 768px)': {
      padding: '15px'
    },
    '@media (max-width: 480px)': {
      padding: '10px'
    }
  },

  // صور متجاوبة
  responsiveImage: {
    width: '100%',
    height: 'auto',
    maxWidth: '100%'
  },

  // نصوص متجاوبة
  title: {
    fontSize: '32px',
    '@media (max-width: 768px)': {
      fontSize: '28px'
    },
    '@media (max-width: 480px)': {
      fontSize: '24px'
    }
  },

  subtitle: {
    fontSize: '20px',
    '@media (max-width: 768px)': {
      fontSize: '18px'
    },
    '@media (max-width: 480px)': {
      fontSize: '16px'
    }
  },

  text: {
    fontSize: '16px',
    '@media (max-width: 480px)': {
      fontSize: '14px'
    }
  }
};