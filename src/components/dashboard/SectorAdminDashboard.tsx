'use client';
import { useState, useEffect } from 'react';
import { Report, ProblemSummary } from '@prisma/client';

export default function SectorAdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [summaries, setSummaries] = useState<ProblemSummary[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, summariesRes] = await Promise.all([
        fetch('/api/reports/sector'),
        fetch('/api/summaries/sector')
      ]);
      
      if (!reportsRes.ok || !summariesRes.ok) {
        console.error('Error fetching dashboard data');
        return;
      }

      const reportsData = await reportsRes.json();
      const summariesData = await summariesRes.json();
      
      setReports(Array.isArray(reportsData) ? reportsData : []);
      setSummaries(Array.isArray(summariesData) ? summariesData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setReports([]);
      setSummaries([]);
    }
  };

  const handleStatusUpdate = async (reportId: number, status: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating report:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* AI Summary Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Problem Summaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries.map((summary) => (
            <div key={summary.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Summary Report</h3>
                  <p className="text-gray-600 mt-2">{summary.summary}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {summary.problems} issues
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Unresolved Reports Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Unresolved Reports</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
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
              {Array.isArray(reports) && reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4">{report.title}</td>
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
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm hover:bg-green-200"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'UNDER_REVIEW')}
                        disabled={isUpdating}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200"
                      >
                        Forward
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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