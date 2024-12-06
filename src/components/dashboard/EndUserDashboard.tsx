'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Report, Sector, Status } from '@prisma/client';

export default function EndUserDashboard() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    // Fetch sectors and user's reports
    const fetchData = async () => {
      const [sectorsRes, reportsRes] = await Promise.all([
        fetch('/api/sectors'),
        fetch('/api/reports/user')
      ]);
      
      const sectorsData = await sectorsRes.json();
      const reportsData = await reportsRes.json();
      
      setSectors(sectorsData);
      setReports(reportsData);
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/reports/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Submit New Report
        </Link>
      </div>

      {/* Sectors Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Sectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sectors.map((sector) => (
            <div
              key={sector.id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="font-medium">{sector.name}</h3>
              <p className="text-gray-600 text-sm">{sector.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reports Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Reports</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{report.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.sectorId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      getStatusColor(report.status)
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleDateString()}
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

function getStatusColor(status: Status): string {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return colors[status];
} 