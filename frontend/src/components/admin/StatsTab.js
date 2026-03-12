import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StatsTab = ({ stats }) => {
  if (!stats) {
    return <div style={styles.loading}>لا توجد بيانات إحصائية</div>;
  }

  // بيانات للرسوم البيانية
  const bookingsChartData = [
    { name: 'المكتملة', value: stats.bookings?.completed || 0 },
    { name: 'النشطة', value: stats.bookings?.active || 0 },
    { name: 'المعلقة', value: stats.bookings?.pending || 0 },
  ];

  const usersChartData = [
    { name: 'موثقين', value: stats.users?.verified || 0 },
    { name: 'في انتظار', value: stats.users?.pending || 0 },
    { name: 'مرفوضين', value: stats.users?.rejected || 0 },
  ];

  const revenueData = [
    { month: 'يناير', revenue: 4500 },
    { month: 'فبراير', revenue: 5200 },
    { month: 'مارس', revenue: 6100 },
    { month: 'أبريل', revenue: 5800 },
    { month: 'ماي', revenue: 6300 },
    { month: 'يونيو', revenue: 7200 },
  ];

  const COLORS = ['#28a745', '#ffc107', '#dc3545', '#17a2b8', '#007bff'];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 إحصائيات المنصة</h2>

      {/* بطاقات الإحصائيات السريعة */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.users?.total || 0}</span>
          <span style={styles.statLabel}>إجمالي المستخدمين</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.users?.verified || 0}</span>
          <span style={styles.statLabel}>موثقين</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.users?.pending || 0}</span>
          <span style={styles.statLabel}>في انتظار التحقق</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.cars?.total || 0}</span>
          <span style={styles.statLabel}>إجمالي السيارات</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.cars?.available || 0}</span>
          <span style={styles.statLabel}>سيارات متاحة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.cars?.pending || 0}</span>
          <span style={styles.statLabel}>سيارات معلقة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.bookings?.total || 0}</span>
          <span style={styles.statLabel}>إجمالي الحجوزات</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.bookings?.active || 0}</span>
          <span style={styles.statLabel}>حجوزات نشطة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.bookings?.pending || 0}</span>
          <span style={styles.statLabel}>حجوزات معلقة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.bookings?.completed || 0}</span>
          <span style={styles.statLabel}>حجوزات مكتملة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.bookings?.monthly || 0}</span>
          <span style={styles.statLabel}>حجوزات هذا الشهر</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{stats.users?.newThisMonth || 0}</span>
          <span style={styles.statLabel}>مستخدمين جدد هذا الشهر</span>
        </div>
      </div>

      {/* قسم الإيرادات */}
      <div style={styles.revenueSection}>
        <h3 style={styles.sectionTitle}>💰 الإيرادات</h3>
        <div style={styles.revenueCards}>
          <div style={styles.revenueCard}>
            <span style={styles.revenueValue}>{stats.revenue?.total || 0} د.ت</span>
            <span style={styles.revenueLabel}>إجمالي الإيرادات</span>
          </div>
          <div style={styles.revenueCard}>
            <span style={styles.revenueValue}>{stats.revenue?.monthly || 0} د.ت</span>
            <span style={styles.revenueLabel}>إيرادات هذا الشهر</span>
          </div>
        </div>
      </div>

      {/* قسم العمولات */}
      <div style={styles.commissionSection}>
        <h3 style={styles.sectionTitle}>💰 عمولات المنصة</h3>
        <div style={styles.commissionCards}>
          <div style={styles.commissionCard}>
            <span style={styles.commissionValue}>{stats.commission?.total || 0} د.ت</span>
            <span style={styles.commissionLabel}>إجمالي العمولات</span>
          </div>
          <div style={styles.commissionCard}>
            <span style={styles.commissionValue}>{stats.commission?.monthly || 0} د.ت</span>
            <span style={styles.commissionLabel}>عمولات هذا الشهر</span>
          </div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div style={styles.chartsGrid}>
        {/* رسم بياني للحجوزات */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>توزيع الحجوزات</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={bookingsChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {bookingsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* رسم بياني للمستخدمين */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>توزيع المستخدمين</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usersChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* رسم بياني للإيرادات الشهرية (نموذجي) */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>الإيرادات الشهرية</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#28a745" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ملخص سريع */}
      <div style={styles.summary}>
        <h3 style={styles.sectionTitle}>📋 ملخص سريع</h3>
        <table style={styles.summaryTable}>
          <tbody>
            <tr>
              <td>نسبة المستخدمين الموثقين</td>
              <td>{stats.users?.total ? ((stats.users.verified / stats.users.total) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td>نسبة السيارات المتاحة</td>
              <td>{stats.cars?.total ? ((stats.cars.available / stats.cars.total) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td>نسبة الحجوزات المكتملة</td>
              <td>{stats.bookings?.total ? ((stats.bookings.completed / stats.bookings.total) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td>متوسط قيمة الحجز</td>
              <td>{stats.bookings?.completed ? (stats.revenue?.total / stats.bookings.completed).toFixed(2) : 0} د.ت</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    },
  },
  statValue: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  revenueSection: {
    marginBottom: '30px',
  },
  commissionSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    marginBottom: '15px',
    color: '#333',
    fontSize: '20px',
  },
  revenueCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  revenueCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  revenueValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: '5px',
  },
  revenueLabel: {
    fontSize: '14px',
    color: '#666',
  },
  commissionCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  commissionCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  commissionValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#17a2b8',
    marginBottom: '5px',
  },
  commissionLabel: {
    fontSize: '14px',
    color: '#666',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
    marginTop: 0,
    marginBottom: '15px',
    color: '#333',
    fontSize: '16px',
    textAlign: 'center',
  },
  summary: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
};

export default StatsTab;