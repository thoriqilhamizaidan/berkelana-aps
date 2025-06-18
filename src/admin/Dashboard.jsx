import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, Filter, TrendingUp, Users, Car } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [userData, setUserData] = useState({
    totalUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    unknownUsers: 0
  });
  const [vehicleData, setVehicleData] = useState({
    totalVehicles: 0,
    shuttle: 0,
    bus: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [viewMode, setViewMode] = useState('overview');

  // Configure API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? import.meta.env.VITE_API_BASE_URL 
    : '/api';

  // Generate years for filter (current year and 2 previous years)
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 2; i--) {
    years.push(i);
  }

  // Months data
  const months = [
    { value: 'all', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  // API functions for fetching real data
  const fetchUserStats = async () => {
    // Mengubah endpoint agar konsisten dengan app.js
    const response = await fetch(`${API_BASE_URL}/user/count`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user stats: ${response.status}`);
    }
    return response.json();
  };

  const fetchVehicleStats = async () => {
    // Mengubah endpoint agar konsisten dengan app.js
    const response = await fetch(`${API_BASE_URL}/kendaraan/count`);
    if (!response.ok) {
      throw new Error(`Failed to fetch vehicle stats: ${response.status}`);
    }
    return response.json();
  };

  const fetchMonthlyData = async (year, month = null) => {
    let url = `${API_BASE_URL}/dashboard/monthly?year=${year}`;
    if (month && month !== 'all') {
      url += `&month=${month}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch monthly data: ${response.status}`);
    }
    return response.json();
  };

  // fetchGrowthData tidak lagi digunakan karena pertumbuhan dihitung dari monthlyData
  // const fetchGrowthData = async () => {
  //   const response = await fetch(`${API_BASE_URL}/dashboard/growth`);
  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch growth data: ${response.status}`);
  //   }
  //   return response.json();
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Starting data fetch...');
        console.log('🌐 API Base URL:', API_BASE_URL);

        // Fetch all data in parallel
        const [userStatsResult, vehicleStatsResult, monthlyResult] = await Promise.all([
          fetchUserStats(),
          fetchVehicleStats(),
          fetchMonthlyData(selectedYear, selectedMonth)
        ]);

        console.log('📊 User Stats:', userStatsResult);
        console.log('🚗 Vehicle Stats:', vehicleStatsResult);
        console.log('📈 Monthly Data:', monthlyResult);

        setUserData({
          totalUsers: userStatsResult.totalUsers || 0,
          maleUsers: userStatsResult.maleUsers || 0,
          femaleUsers: userStatsResult.femaleUsers || 0,
          unknownUsers: userStatsResult.unknownUsers || 0
        });

        setVehicleData({
          totalVehicles: vehicleStatsResult.totalVehicles || 0,
          shuttle: vehicleStatsResult.shuttle || 0,
          bus: vehicleStatsResult.bus || 0
        });

        // Transform monthly data to match the expected format
        const transformedMonthlyData = monthlyResult.map(item => ({
          month: months.find(m => m.value === item.month.toString())?.label || `Bulan ${item.month}`,
          monthNumber: item.month,
          users: item.users || 0,
          vehicles: item.vehicles || 0,
          maleUsers: item.maleUsers || 0,
          femaleUsers: item.femaleUsers || 0,
          shuttle: item.shuttle || 0,
          bus: item.bus || 0
        }));

        // Sort monthlyData by monthNumber if 'all' months are selected
        if (selectedMonth === 'all') {
          transformedMonthlyData.sort((a, b) => a.monthNumber - b.monthNumber);
        }

        setMonthlyData(transformedMonthlyData);

      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setError(`Failed to load dashboard data: ${error.message}`);
        
        // Reset data on error
        setUserData({
          totalUsers: 0,
          maleUsers: 0,
          femaleUsers: 0,
          unknownUsers: 0
        });
        setVehicleData({
          totalVehicles: 0,
          shuttle: 0,
          bus: 0
        });
        setMonthlyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  // Calculate growth percentage from real data
  const calculateGrowthPercentage = () => {
    // Growth calculation should be based on the last two relevant months for the current year,
    // or if only one month is selected, it's not meaningful.
    if (monthlyData.length < 2) return "0";
    
    // Sort monthlyData by monthNumber to ensure correct order for growth calculation
    const sortedData = [...monthlyData].sort((a, b) => a.monthNumber - b.monthNumber);
    
    const currentMonthUsers = sortedData[sortedData.length - 1].users;
    const previousMonthUsers = sortedData[sortedData.length - 2].users;
    
    if (previousMonthUsers === 0) return "0";
    
    const growth = ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100;
    return growth.toFixed(1);
  };

  // Filter monthly data based on selected month (already handled in useEffect, but keep this for consistency)
  const filteredMonthlyData = selectedMonth === 'all' 
    ? monthlyData 
    : monthlyData.filter(data => data.monthNumber.toString() === selectedMonth);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">⚠️ Connection Error</strong>
          <p className="mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const userChartData = [
    { name: 'Laki-laki', value: userData.maleUsers || 0, color: '#10B981' },
    { name: 'Perempuan', value: userData.femaleUsers || 0, color: '#F472B6' },
    ...(userData.unknownUsers > 0 ? [{ name: 'Tidak Diketahui', value: userData.unknownUsers, color: '#9CA3AF' }] : [])
  ];

  const vehicleChartData = [
    { name: 'Shuttle', value: vehicleData.shuttle || 0, color: '#8B5CF6' },
    { name: 'Bus', value: vehicleData.bus || 0, color: '#6B7280' },
  ];

  const growthPercentage = calculateGrowthPercentage();

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
    Dashboard Administrator #BERKELANA
  </h1>
  <p className="text-sm sm:text-base text-gray-600">Kelola dan pantau data pengguna dan armada</p>
</div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mb-4">
    <div className="flex items-center space-x-2">
      <Filter className="w-5 h-5 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">Filter Data:</span>
    </div>
    
    {/* Year Filter */}
    <div className="flex items-center space-x-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <select 
        value={selectedYear} 
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>

    {/* Month Filter */}
    <select 
      value={selectedMonth} 
      onChange={(e) => setSelectedMonth(e.target.value)}
      className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {months.map(month => (
        <option key={month.value} value={month.value}>{month.label}</option>
      ))}
    </select>
  </div>

  {/* View Mode Tabs */}
  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 rounded-lg p-1">
    <button 
      onClick={() => setViewMode('overview')}
      className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
        viewMode === 'overview' 
          ? 'bg-white text-blue-600 shadow-sm' 
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      Overview
    </button>
    <button 
      onClick={() => setViewMode('monthly')}
      className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
        viewMode === 'monthly' 
          ? 'bg-white text-blue-600 shadow-sm' 
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      Trend Bulanan
    </button>
    <button 
      onClick={() => setViewMode('comparison')}
      className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
        viewMode === 'comparison' 
          ? 'bg-white text-blue-600 shadow-sm' 
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      Perbandingan
    </button>
  </div>
</div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Pengguna</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{userData.totalUsers}</p>
        <p className={`text-xs sm:text-sm ${parseFloat(growthPercentage) >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
          {parseFloat(growthPercentage) >= 0 ? '+' : ''}{growthPercentage}% dari bulan lalu
        </p>
      </div>
      <div className="p-2 sm:p-3 bg-blue-100 rounded-lg ml-3">
        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Armada</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{vehicleData.totalVehicles}</p>
        <p className="text-xs sm:text-sm text-gray-600 truncate">
          {vehicleData.shuttle} shuttle, {vehicleData.bus} bus
        </p>
      </div>
      <div className="p-2 sm:p-3 bg-purple-100 rounded-lg ml-3">
        <Car className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
      </div>
    </div>
  </div>

  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:col-span-2 xl:col-span-1">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Tingkat Pertumbuhan</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{growthPercentage}%</p>
        <p className={`text-xs sm:text-sm ${parseFloat(growthPercentage) >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
          {parseFloat(growthPercentage) >= 0 ? 'Meningkat' : 'Menurun'}
        </p>
      </div>
      <div className="p-2 sm:p-3 bg-green-100 rounded-lg ml-3">
        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
      </div>
    </div>
  </div>
</div>

          {/* Pie Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
  {/* Pengguna */}
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Distribusi Pengguna</h3>
    <div className="flex flex-col sm:flex-row items-center">
      <div className="w-32 h-32 sm:w-40 sm:h-40 mb-4 sm:mb-0">
        {userData.totalUsers > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userChartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {userChartData.map((entry, index) => (
                  <Cell key={`user-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
            <span className="text-gray-500 text-xs sm:text-sm">No Data</span>
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-2 sm:space-y-3 sm:ml-6 w-full sm:w-auto">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600">
            {userData.maleUsers || 0} Laki-laki
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-pink-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600">
            {userData.femaleUsers || 0} Perempuan
          </span>
        </div>
        {userData.unknownUsers > 0 && (
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">
              {userData.unknownUsers} Tidak Diketahui
            </span>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Kendaraan */}
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Distribusi Armada</h3>
    <div className="flex flex-col sm:flex-row items-center">
      <div className="w-32 h-32 sm:w-40 sm:h-40 mb-4 sm:mb-0">
        {vehicleData.totalVehicles > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vehicleChartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {vehicleChartData.map((entry, index) => (
                  <Cell key={`vehicle-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
            <span className="text-gray-500 text-xs sm:text-sm">No Data</span>
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-2 sm:space-y-3 sm:ml-6 w-full sm:w-auto">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-purple-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600">
            {vehicleData.shuttle || 0} Shuttle
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600">
            {vehicleData.bus || 0} Bus
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>
      )}

      {/* Monthly Trend Mode */}
      {viewMode === 'monthly' && (
  <div className="space-y-4 sm:space-y-6">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
        Trend Registrasi Pengguna {selectedYear}
      </h3>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              interval={window.innerWidth < 640 ? 1 : 0}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Total Pengguna"
            />
            <Line 
              type="monotone" 
              dataKey="maleUsers" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Laki-laki"
            />
            <Line 
              type="monotone" 
              dataKey="femaleUsers" 
              stroke="#F472B6" 
              strokeWidth={2}
              name="Perempuan"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
        Penambahan Armada {selectedYear}
      </h3>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              interval={window.innerWidth < 640 ? 1 : 0}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="shuttle" fill="#8B5CF6" name="Shuttle" />
            <Bar dataKey="bus" fill="#6B7280" name="Bus" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
)}

      {/* Comparison Mode */}
     {viewMode === 'comparison' && (
  <div className="space-y-4 sm:space-y-6">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
          Perbandingan Pengguna vs Armada
        </h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                interval={window.innerWidth < 640 ? 1 : 0}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#3B82F6" name="Pengguna" />
              <Bar dataKey="vehicles" fill="#8B5CF6" name="Armada" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
          Rasio Pengguna per Armada
        </h3>
        <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
          {filteredMonthlyData.map((data, index) => {
            const ratio = data.vehicles > 0 ? (data.users / data.vehicles).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate pr-2">{data.month}</span>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-base sm:text-lg font-bold text-blue-600">{ratio}</span>
                  <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">pengguna/armada</span>
                  <span className="text-xs text-gray-500 sm:hidden">p/a</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Monthly Summary Table */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
        Ringkasan Data {selectedMonth === 'all' ? `Tahun ${selectedYear}` : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
      </h3>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bulan
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pengguna
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Laki-laki
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Perempuan
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Armada
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Shuttle
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Bus
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMonthlyData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {data.month}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {data.users}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                    {data.maleUsers}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                    {data.femaleUsers}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {data.vehicles}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                    {data.shuttle}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                    {data.bus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;