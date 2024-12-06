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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
  };

  // Function to approve a solution
  const approveSolution = async (reportId: number) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        // Update the UI or state as needed
      }
    } catch (error) {
      console.error('Error approving solution:', error);
    }
  };

  // Function to generate and send reports
  const generateAndSendReports = async () => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
      });
      if (response.ok) {
        // Notify the user that reports have been sent
      }
    } catch (error) {
      console.error('Error generating reports:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Priority Sectors Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Priority Sectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorities
            .sort((a, b) => b.priority - a.priority)
            .map((priority) => {
              const sector = sectors.find(s => s.id === priority.sectorId);
              return (
                <div
                  key={priority.id}
                  className="bg-white p-6 rounded-lg shadow"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{sector?.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
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
        <h2 className="text-xl font-semibold mb-4">Historical Trends</h2>
        <div className="grid grid-cols-1 gap-6">
          {trends.map((trend) => (
            <div key={trend.sectorId} className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium mb-4">{trend.sectorName}</h3>
              <div className="h-64">
                <Line
                  data={{
                    labels: trend.labels,
                    datasets: [
                      {
                        label: 'Unresolved Issues',
                        data: trend.data,
                        borderColor: 'rgb(59, 130, 246)',
                        tension: 0.1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function getPriorityColor(priority: number): string {
  if (priority >= 8) return 'bg-red-100 text-red-800';
  if (priority >= 5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
} 