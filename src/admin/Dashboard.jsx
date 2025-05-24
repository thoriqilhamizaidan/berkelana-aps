// Dashboard.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const penumpangData = [
    { name: 'Penumpang Shuttle', value: 100, color: '#8B5CF6' },
    { name: 'Penumpang Bus', value: 50, color: '#6B7280' }
  ];

  const armadaData = [
    { name: 'Shuttle', value: 2, color: '#10B981' },
    { name: 'Bus', value: 4, color: '#6B7280' }
  ];

  const penumpangDataApril = [
    { name: 'Penumpang Shuttle', value: 500, color: '#8B5CF6' },
    { name: 'Penumpang Bus', value: 4000, color: '#6B7280' }
  ];

  const armadaDataApril = [
    { name: 'Shuttle', value: 62, color: '#10B981' },
    { name: 'Bus', value: 173, color: '#6B7280' }
  ];

  return (
    <div className="flex-1 p-8 bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Selamat Datang Di Halaman Administrator Website #BERKELANA!
        </h1>
      </div>

      <div className="bg-gray-100 rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Laporan Penjualan Tiket</span>
          <ChevronRight size={16} />
        </div>
      </div>

      {/* Mei 2025 Card */}
      <div className="bg-gray-100 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-4">
          <div className="bg-gray-100 rounded-lg px-4 py-2 inline-block mb-4 border border-purple-500">
            <span className="text-sm font-medium text-gray-700">Sabtu, 10 Mei 2025</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Penumpang Mei */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={penumpangData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {penumpangData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">150 Penumpang</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-600">100 Penumpang Shuttle</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-sm text-gray-600">50 Penumpang Bus</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Armada Mei */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={armadaData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {armadaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">6 Armada berjalan</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">2 Shuttle</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-sm text-gray-600">4 Bus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* April 2025 Card */}
      <div className="bg-gray-100 rounded-xl shadow-sm border border-gray-200">
        <div className="p-4">
         <div className="bg-gray-100 rounded-lg px-4 py-2 inline-block mb-4 border border-purple-500">
        <span className="text-sm font-medium text-gray-700">April 2025</span>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Penumpang April */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={penumpangDataApril}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {penumpangDataApril.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">4500 Penumpang</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-600">500 Penumpang Shuttle</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-sm text-gray-600">4000 Penumpang Bus</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Armada April */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={armadaDataApril}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {armadaDataApril.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">235 Armada berjalan</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">62 Shuttle</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-sm text-gray-600">173 Bus</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
