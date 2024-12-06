'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EndUserDashboard from '@/components/dashboard/EndUserDashboard';
import SectorAdminDashboard from '@/components/dashboard/SectorAdminDashboard';
import GovtAdminDashboard from '@/components/dashboard/GovtAdminDashboard';
import { Role } from '@prisma/client';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Add console.log to debug session data
  console.log('Session:', session);
  console.log('Status:', status);
  console.log('User Role:', session?.user?.role);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session || !session.user) {
    return null;
  }

  const userRole = session.user.role as Role;

  // Render appropriate dashboard based on user role
  return (
    <div className="min-h-screen bg-gray-50">
      {userRole === 'END_USER' && (
        <EndUserDashboard />
      )}
      {userRole === 'SECTOR_ADMIN' && (
        <SectorAdminDashboard />
      )}
      {userRole === 'GOVT_ADMIN' && (
        <GovtAdminDashboard />
      )}
      {!['END_USER', 'SECTOR_ADMIN', 'GOVT_ADMIN'].includes(userRole) && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Invalid Role</h1>
            <p className="text-gray-600 mt-2">Current role: {userRole}</p>
          </div>
        </div>
      )}
    </div>
  );
} 