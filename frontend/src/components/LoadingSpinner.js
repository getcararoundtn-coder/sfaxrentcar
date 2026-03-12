const LoadingSpinner = ({ size = 40, color = '#007bff' }) => {
  return (
    <div style={styles.container}>
      <div style={{
        ...styles.spinner,
        width: size,
        height: size,
        borderTopColor: color,
      }} />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  spinner: {
    border: '3px solid #f3f3f3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// أضف هذا الـ style في ملف CSS الرئيسي
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default LoadingSpinner;