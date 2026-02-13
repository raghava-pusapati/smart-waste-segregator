import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { wasteAPI } from '../services/api';
import { Award, TrendingUp, Scan, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState(new Set());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        wasteAPI.getStats(),
        wasteAPI.getHistory(1, 100) // Get more history for date grouping
      ]);
      
      setStats(statsRes.data.data);
      setHistory(historyRes.data.data.history);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const toggleDate = (date) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Category distribution chart data
  const categoryData = {
    labels: stats?.categoryDistribution.map(item => item.category.charAt(0).toUpperCase() + item.category.slice(1)) || [],
    datasets: [{
      data: stats?.categoryDistribution.map(item => item.count) || [],
      backgroundColor: [
        'rgba(6, 182, 212, 0.8)',    // Cyan for glass
        'rgba(211, 47, 47, 0.8)',     // Red for hazardous
        'rgba(75, 85, 99, 0.8)',      // Gray for metal
        'rgba(76, 175, 80, 0.8)',     // Green for organic
        'rgba(245, 158, 11, 0.8)',    // Amber for paper
        'rgba(33, 150, 243, 0.8)'     // Blue for plastic
      ],
      borderColor: [
        'rgba(6, 182, 212, 1)',
        'rgba(211, 47, 47, 1)',
        'rgba(75, 85, 99, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(33, 150, 243, 1)'
      ],
      borderWidth: 2
    }]
  };

  // Monthly activity chart data
  const monthlyData = {
    labels: stats?.monthlyActivity.map(item => item.month) || [],
    datasets: [{
      label: 'Scans',
      data: stats?.monthlyActivity.map(item => item.count) || [],
      backgroundColor: 'rgba(76, 175, 80, 0.8)',
      borderColor: 'rgba(76, 175, 80, 1)',
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const categoryIcons = {
    glass: '🥃',
    hazardous: '⚠️',
    metal: '🔧',
    organic: '🌱',
    paper: '📄',
    plastic: '♻️',
    textile: '👕',
    'e-waste': '💻',
    battery: '🔋'
  };

  const categoryColors = {
    glass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    hazardous: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    metal: 'bg-blue-100 text-blue-800 border-blue-300',
    organic: 'bg-green-100 text-green-800 border-green-300',
    paper: 'bg-blue-100 text-blue-800 border-blue-300',
    plastic: 'bg-blue-100 text-blue-800 border-blue-300',
    textile: 'bg-blue-100 text-blue-800 border-blue-300',
    'e-waste': 'bg-red-100 text-red-800 border-red-300',
    battery: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's your environmental impact overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm mb-1">Eco Score</p>
                <p className="text-4xl font-bold">{stats?.ecoScore || 0}</p>
              </div>
              <Award className="w-12 h-12 text-primary-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Scans</p>
                <p className="text-4xl font-bold">{stats?.totalScans || 0}</p>
              </div>
              <Scan className="w-12 h-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">This Month</p>
                <p className="text-4xl font-bold">
                  {stats?.monthlyActivity[stats.monthlyActivity.length - 1]?.count || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Member Since</p>
                <p className="text-lg font-bold">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Category Distribution
            </h2>
            <div className="h-64">
              {stats?.categoryDistribution.length > 0 ? (
                <Doughnut data={categoryData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data yet. Start scanning!
                </div>
              )}
            </div>
          </motion.div>

          {/* Monthly Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Monthly Activity
            </h2>
            <div className="h-64">
              {stats?.monthlyActivity.length > 0 ? (
                <Bar data={monthlyData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data yet. Start scanning!
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Scans - Date Wise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Scans
          </h2>
          
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((dateGroup) => (
                <div
                  key={dateGroup.date}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Date Header - Clickable */}
                  <button
                    onClick={() => toggleDate(dateGroup.date)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900">
                          {dateGroup.date}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1 flex-wrap gap-y-1">
                          {Object.entries(dateGroup.categoryCounts).map(([category, count]) => (
                            <span
                              key={category}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
                            >
                              <span className="mr-1">{categoryIcons[category] || '📦'}</span>
                              {category}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">
                        {dateGroup.scans.length} {dateGroup.scans.length === 1 ? 'scan' : 'scans'}
                      </span>
                      {expandedDates.has(dateGroup.date) ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {/* Expandable Content */}
                  <AnimatePresence>
                    {expandedDates.has(dateGroup.date) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {dateGroup.scans.map((scan) => (
                            <div
                              key={scan._id}
                              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                            >
                              {/* Image */}
                              {scan.imageUrl && (
                                <div className="relative h-48 bg-gray-100">
                                  <img
                                    src={scan.imageUrl}
                                    alt={scan.category}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                  {/* Category Badge */}
                                  <div className="absolute top-2 right-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2 shadow-lg ${categoryColors[scan.category] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                                      <span className="mr-1.5 text-lg">{categoryIcons[scan.category] || '📦'}</span>
                                      {scan.category.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Content */}
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${categoryColors[scan.category] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                                    {categoryIcons[scan.category] || '📦'} {scan.category}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(scan.timestamp).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>

                                {/* Disposal Guidance */}
                                <div className="text-sm text-gray-700 leading-relaxed">
                                  <p className="font-semibold text-gray-900 mb-1">Disposal:</p>
                                  <p className="line-clamp-3">{scan.disposalGuidance}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Scan className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No scans yet. Start by scanning your first waste item!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
