'use client';
import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { FiHome, FiFileText, FiSettings, FiLogOut, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import type { Report, ProblemSummary } from '@prisma/client';
import Link from 'next/link';

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
      const [reportsRes, summariesRes] = await Promise.all([
        fetch('/api/reports/sector'),
        fetch('/api/summaries/sector')
      ]);
      
      if (!reportsRes.ok || !summariesRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const reportsData = await reportsRes.json();
      const summariesData = await summariesRes.json();
      
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

      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Failed to update report status');
    } finally {
      setIsUpdating(false);
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
                <span className="ml-2 text-xl font-semibold text-gray-900">Sector Admin</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={fetchDashboardData} className="p-2 rounded-full hover:bg-gray-100">
                <FiRefreshCw className={`h-5 w-5 text-gray-600 ${isUpdating ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100">
                <FiSettings className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="/logout" className="p-2 rounded-full hover:bg-gray-100">
                <FiLogOut className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        
        {/* Problem Summaries Section */}
        <section className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FiFileText className="h-5 w-5 mr-2 text-blue-600" />
            <span>Problem Summaries</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problemSummaries.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500 py-8">
                No problem summaries available
              </div>
            ) : (
              problemSummaries.map((summary) => (
                <div key={summary.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg text-gray-900">{summary.sector.name}</h3>
                      <p className="text-gray-600 mt-2">{summary.summary}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(summary.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {summary.problems} issues
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Unresolved Reports Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FiCheckCircle className="h-5 w-5 mr-2 text-blue-600" />
            <span>Unresolved Reports</span>
          </h2>
          <div className="overflow-x-auto">
            {reports.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No unresolved reports found
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.title || 'No Title'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{report.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          getStatusBadgeColor(report.status)
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
                            disabled={isUpdating}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(report.id, 'UNDER_REVIEW')}
                            disabled={isUpdating}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-lg mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 Nagorik Desk. All rights reserved.
          </p>
        </div>
      </footer>
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