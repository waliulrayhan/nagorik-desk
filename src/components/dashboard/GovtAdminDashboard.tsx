'use client';
import { useState, useEffect } from 'react';
import { ResolutionPriority, Sector } from '@prisma/client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FiHome, FiFileText, FiSettings, FiLogOut, FiRefreshCw, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SectorTrend {
  sectorId: number;
  sectorName: string;
  data: number[];
  labels: string[];
}

export default function GovtAdminDashboard() {
  const [priorities, setPriorities] = useState<ResolutionPriority[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [trends, setTrends] = useState<SectorTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [prioritiesRes, sectorsRes, trendsRes] = await Promise.all([
        fetch('/api/priorities'),
        fetch('/api/sectors'),
        fetch('/api/trends')
      ]);
      
      const prioritiesData = await prioritiesRes.json();
      const sectorsData = await sectorsRes.json();
      const trendsData = await trendsRes.json();
      
      setPriorities(prioritiesData);
      setSectors(sectorsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveSolution = async (reportId: number) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving solution:', error);
    }
  };

  const generateAndSendReports = async () => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
      });
      if (response.ok) {
        // Show success notification
      }
    } catch (error) {
      console.error('Error generating reports:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <FiHome className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">Government Admin</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchDashboardData} 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isLoading}
              >
                <FiRefreshCw className={`h-5 w-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <FiSettings className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="/logout" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <FiLogOut className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Priority Sectors Section */}
        <section className="mb-8">
          <div className="flex items-center mb-4">
            <FiBarChart2 className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Priority Sectors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priorities
              .sort((a, b) => b.priority - a.priority)
              .map((priority) => {
                const sector = sectors.find(s => s.id === priority.sectorId);
                return (
                  <div
                    key={priority.id}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-800">{sector?.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getPriorityColor(priority.priority)
                      }`}>
                        Priority: {priority.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Trends Section */}
        <section>
          <div className="flex items-center mb-4">
            <FiTrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Historical Trends</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {trends.map((trend) => (
              <div key={trend.sectorId} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-medium mb-4 text-gray-800">{trend.sectorName}</h3>
                <div className="h-64">
                  <Line
                    data={{
                      labels: trend.labels,
                      datasets: [
                        {
                          label: 'Unresolved Issues',
                          data: trend.data,
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.1,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-lg mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">© 2024 Government Admin Dashboard. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/help" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Help</Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getPriorityColor(priority: number): string {
  if (priority >= 8) return 'bg-red-100 text-red-800';
  if (priority >= 5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}