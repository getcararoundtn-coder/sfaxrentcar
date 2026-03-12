import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API from '../../services/api';
import { showSuccess, showError } from '../../utils/ToastConfig';

const ReportsTab = ({ reports, onGenerate }) => {
  const [reportType, setReportType] = useState('bookings');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  // بيانات تجريبية للرسوم البيانية
  const sampleData = [
    { month: 'يناير', bookings: 45, revenue: 4500, users: 12, cars: 8 },
    { month: 'فبراير', bookings: 52, revenue: 5200, users: 15, cars: 10 },
    { month: 'مارس', bookings: 61, revenue: 6100, users: 18, cars: 12 },
    { month: 'أبريل', bookings: 58, revenue: 5800, users: 16, cars: 11 },
    { month: 'ماي', bookings: 63, revenue: 6300, users: 20, cars: 14 },
    { month: 'يونيو', bookings: 72, revenue: 7200, users: 22, cars: 16 },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // محاولة جلب البيانات من API
      const response = await API.post('/admin/reports/generate', {
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
        showSuccess('✅ تم إنشاء التقرير بنجاح');
        
        // تحديث بيانات الرسم البياني حسب نوع التقرير
        updateChartData(response.data.data);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      showError('❌ فشل إنشاء التقرير، استخدام بيانات تجريبية');
      
      // استخدام بيانات تجريبية في حالة الفشل
      const mockData = generateMockData(reportType);
      setReportData(mockData);
      updateChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (type) => {
    const data = [];
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= days; i += Math.ceil(days / 10)) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      if (type === 'bookings') {
        data.push({
          date: date.toLocaleDateString('ar-TN'),
          value: Math.floor(Math.random() * 20) + 5
        });
      } else if (type === 'revenue') {
        data.push({
          date: date.toLocaleDateString('ar-TN'),
          value: Math.floor(Math.random() * 1000) + 500
        });
      } else if (type === 'users') {
        data.push({
          date: date.toLocaleDateString('ar-TN'),
          value: Math.floor(Math.random() * 10) + 1
        });
      } else if (type === 'cars') {
        data.push({
          date: date.toLocaleDateString('ar-TN'),
          value: Math.floor(Math.random() * 15) + 2
        });
      }
    }
    
    return { data };
  };

  const updateChartData = (data) => {
    if (data && data.data) {
      setChartData(data.data);
    } else {
      setChartData(sampleData);
    }
  };

  const getChartTitle = () => {
    switch(reportType) {
      case 'bookings': return 'الحجوزات';
      case 'revenue': return 'الإيرادات';
      case 'users': return 'المستخدمين الجدد';
      case 'cars': return 'السيارات المضافة';
      default: return 'البيانات';
    }
  };

  const getChartColor = () => {
    switch(reportType) {
      case 'bookings': return '#007bff';
      case 'revenue': return '#28a745';
      case 'users': return '#ffc107';
      case 'cars': return '#17a2b8';
      default: return '#007bff';
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // عنوان التقرير
      doc.setFontSize(18);
      doc.text(`تقرير ${getChartTitle()}`, 105, 15, { align: 'center' });
      
      // تاريخ التقرير
      doc.setFontSize(10);
      doc.text(`من: ${new Date(dateRange.startDate).toLocaleDateString('ar-TN')}`, 20, 25);
      doc.text(`إلى: ${new Date(dateRange.endDate).toLocaleDateString('ar-TN')}`, 20, 32);
      
      // جدول البيانات
      const tableColumn = ["التاريخ", "القيمة"];
      const tableRows = [];
      
      const dataToExport = chartData.length > 0 ? chartData : sampleData;
      dataToExport.forEach(item => {
        const rowData = [
          item.date || item.month,
          item.value || item[reportType] || item.revenue || item.bookings || item.users || item.cars
        ];
        tableRows.push(rowData);
      });
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'striped',
        styles: { font: 'arial', halign: 'center' },
        headStyles: { fillColor: [0, 123, 255] }
      });
      
      // حفظ الملف
      doc.save(`تقرير_${getChartTitle()}_${new Date().toISOString().split('T')[0]}.pdf`);
      showSuccess('✅ تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showError('❌ فشل تصدير التقرير');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📈 التقارير والإحصائيات</h2>

      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <label>نوع التقرير:</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            style={styles.select}
          >
            <option value="bookings">📅 الحجوزات</option>
            <option value="revenue">💰 الإيرادات</option>
            <option value="users">👥 المستخدمين</option>
            <option value="cars">🚗 السيارات</option>
          </select>
        </div>

        <div style={styles.controlGroup}>
          <label>من تاريخ:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            style={styles.input}
          />
        </div>

        <div style={styles.controlGroup}>
          <label>إلى تاريخ:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            style={styles.input}
          />
        </div>

        <button 
          onClick={handleGenerate} 
          style={styles.generateButton}
          disabled={loading}
        >
          {loading ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
        </button>

        {reportData && (
          <button 
            onClick={exportToPDF} 
            style={styles.pdfButton}
          >
            📥 تصدير PDF
          </button>
        )}
      </div>

      <div style={styles.chartsGrid}>
        {/* رسم بياني خطي */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>الرسم البياني - {getChartTitle()}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.length > 0 ? chartData : sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartData[0]?.date ? 'date' : 'month'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={reportType === 'revenue' ? 'revenue' : 
                         reportType === 'bookings' ? 'bookings' :
                         reportType === 'users' ? 'users' : 'cars'} 
                stroke={getChartColor()} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* رسم بياني بالأعمدة */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>تحليل {getChartTitle()}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.length > 0 ? chartData : sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartData[0]?.date ? 'date' : 'month'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={reportType === 'revenue' ? 'revenue' : 
                         reportType === 'bookings' ? 'bookings' :
                         reportType === 'users' ? 'users' : 'cars'} 
                fill={getChartColor()} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {reportData && (
        <div style={styles.reportResult}>
          <h3>📊 نتيجة التقرير</h3>
          
          <div style={styles.statsSummary}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>إجمالي {getChartTitle()}:</span>
              <span style={styles.statValue}>
                {reportData.data?.reduce((sum, item) => sum + (item.value || 0), 0) || 
                 sampleData.reduce((sum, item) => sum + (item[reportType] || 0), 0)}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>المتوسط اليومي:</span>
              <span style={styles.statValue}>
                {Math.round((reportData.data?.reduce((sum, item) => sum + (item.value || 0), 0) || 
                 sampleData.reduce((sum, item) => sum + (item[reportType] || 0), 0)) / 
                 (reportData.data?.length || sampleData.length))}
              </span>
            </div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.dataTable}>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>القيمة</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.data || sampleData).map((item, index) => (
                  <tr key={index}>
                    <td>{item.date || item.month}</td>
                    <td>{item.value || item[reportType] || item.revenue || item.bookings || item.users || item.cars}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px',
  },
  controls: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    alignItems: 'flex-end',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minWidth: '150px',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minWidth: '150px',
  },
  generateButton: {
    padding: '8px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    height: '35px',
    minWidth: '120px',
  },
  pdfButton: {
    padding: '8px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    height: '35px',
    minWidth: '120px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  chartCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  chartTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    color: '#333',
    textAlign: 'center',
  },
  reportResult: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  statsSummary: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  statItem: {
    flex: 1,
    minWidth: '200px',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  statLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  statValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: '600',
    color: '#007bff',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
};

export default ReportsTab;