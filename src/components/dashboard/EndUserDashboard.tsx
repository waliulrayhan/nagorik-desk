'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Report, Sector, Status, Vote } from '@prisma/client';
import { useSession } from 'next-auth/react';

// Add this type to include relations
type ReportWithRelations = Report & {
  sector: {
    id: number;
    name: string;
  };
  subsector: {
    id: number;
    name: string;
  };
  votes: Vote[];
};

export default function EndUserDashboard() {
  const { data: session, status } = useSession();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [votes, setVotes] = useState<Record<number, Vote>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        try {
          setIsLoading(true);
          setError(null);

          const [sectorsRes, reportsRes] = await Promise.all([
            fetch('/api/sectors'),
            fetch('/api/reports/user')
          ]);

          console.log('API Responses:', {
            sectors: sectorsRes.status,
            reports: reportsRes.status
          });

          const sectorsData = await sectorsRes.json();
          const reportsData = await reportsRes.json();

          console.log('Fetched Data:', {
            sectors: sectorsData,
            reports: reportsData
          });

          setSectors(sectorsData);
          setReports(reportsData);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to load dashboard data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Please sign in to view your dashboard.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  console.log('Rendering with data:', {
    sectors: sectors.length,
    reports: reports.length,
    status,
    isLoading
  });

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

      {sectors.length > 0 && (
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
      )}

      {reports.length > 0 ? (
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
                    <td className="px-6 py-4 whitespace-nowrap">{report.title || 'Untitled'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.sector.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
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
      ) : (
        <p>No reports found.</p>
      )}
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