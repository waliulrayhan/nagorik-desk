'use client';
import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { Report, ProblemSummary } from '@prisma/client';

interface ReportWithUser extends Report {
  user: {
    email: string;
    nid: string;
    phone: string;
  };
  sector: {
    name: string;
  };
  subsector: {
    name: string;
  };
}

interface ProblemSummaryWithSector {
  id: number;
  summary: string;
  problems: number;
  createdAt: string;
  sector: {
    id: number;
    name: string;
  };
}

export default function SectorAdminDashboard() {
  const [problemSummaries, setProblemSummaries] = useState<ProblemSummaryWithSector[]>([]);
  const [reports, setReports] = useState<ReportWithUser[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      console.log('Fetching dashboard data...'); // Debug log

      const [reportsRes, summariesRes] = await Promise.all([
        fetch('/api/reports/sector'),
        fetch('/api/summaries/sector')
      ]);
      
      if (!reportsRes.ok || !summariesRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const reportsData = await reportsRes.json();
      const summariesData = await summariesRes.json();
      
      console.log('Reports Data:', reportsData); // Debug log
      console.log('Problem Summaries Data:', summariesData); // Debug log
      
      setReports(reportsData);
      setProblemSummaries(summariesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setReports([]);
      setProblemSummaries([]);
    }
  };

  const handleStatusUpdate = async (reportId: number, status: string) => {
    if (!confirm(`Are you sure you want to mark this report as ${status}?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      // Refresh the dashboard data after successful update
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Failed to update report status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Problem Summaries Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span>Problem Summaries</span>
          <button 
            onClick={fetchDashboardData}
            className="ml-2 p-1 hover:bg-gray-100 rounded"
            title="Refresh data"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-500" />
          </button>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problemSummaries.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-4">
              No problem summaries available
            </div>
          ) : (
            problemSummaries.map((summary) => (
              <div key={summary.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{summary.sector.name}</h3>
                    <p className="text-gray-600 mt-2">{summary.summary}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(summary.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {summary.problems} issues
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Unresolved Reports Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Unresolved Reports</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No unresolved reports found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{report.title || 'No Title'}</td>
                    <td className="px-6 py-4">{report.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        getStatusBadgeColor(report.status)
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
                          disabled={isUpdating}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'UNDER_REVIEW')}
                          disabled={isUpdating}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Forward
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function getStatusBadgeColor(status: string): string {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return colors[status as keyof typeof colors] || colors.PENDING;
}