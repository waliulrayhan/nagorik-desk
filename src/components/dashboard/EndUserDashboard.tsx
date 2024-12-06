'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Report, Sector, Status, Vote } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { FiHome, FiFileText, FiSettings, FiLogOut, FiPlus, FiFolder, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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

          const sectorsData = await sectorsRes.json();
          const reportsData = await reportsRes.json();

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
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-xl">Please sign in to view your dashboard.</p>
          <Link href="/auth/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <FiHome className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-800">Nagorik Desk</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100">
                <FiSettings className="h-5 w-5 text-gray-600" />
              </Link>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <FiLogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Link
            href="/reports/new"
            className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Submit New Report
          </Link>
        </div>

        {sectors.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <FiFolder className="mr-2" />
              Available Sectors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sectors.map((sector) => (
                <div
                  key={sector.id}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{sector.name}</h3>
                  <p className="text-gray-600">{sector.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {reports.length > 0 ? (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <FiFileText className="mr-2" />
              Your Reports
            </h2>
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Sector</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{report.title || 'Untitled'}</td>
                      <td className="px-6 py-4">{report.sector.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(report.status)}`}>
                          <FiCheckCircle className="mr-1" />
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No reports found.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-lg mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm">
              © 2024 Nagorik Desk. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/about" className="text-gray-600 hover:text-blue-600">About</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600">Privacy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-blue-600">Terms</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
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