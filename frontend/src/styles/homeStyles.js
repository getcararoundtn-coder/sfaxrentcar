export const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  section: {
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '32px',
    color: '#333',
    marginBottom: '40px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '15px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '5px',
  },
  cardPrice: {
    fontSize: '16px',
    color: '#28a745',
    fontWeight: '600',
    marginBottom: '5px',
  },
  cardLocation: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px',
  },
  button: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#0056b3',
    },
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    ':hover': {
      backgroundColor: '#545b62',
    },
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
    ':hover': {
      backgroundColor: '#218838',
    },
  },
  filterBar: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  filterInput: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minWidth: '150px',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minWidth: '150px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#007bff',
    display: 'block',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  testimonialCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  testimonialText: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '15px',
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontWeight: '600',
    color: '#333',
  },
  testimonialRating: {
    color: '#ffc107',
    marginBottom: '10px',
  },
  footer: {
    backgroundColor: '#343a40',
    color: 'white',
    padding: '40px 20px',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  footerLink: {
    color: '#adb5bd',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '8px',
    ':hover': {
      color: 'white',
    },
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '80px 20px',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  heroSubtitle: {
    fontSize: '20px',
    marginBottom: '30px',
  },
  heroButton: {
    padding: '12px 30px',
    fontSize: '18px',
  },
  howItWorksStep: {
    textAlign: 'center',
    padding: '20px',
  },
  stepIcon: {
    fontSize: '48px',
    marginBottom: '15px',
    color: '#007bff',
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  stepDesc: {
    fontSize: '14px',
    color: '#666',
  },
};