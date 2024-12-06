'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step1FormData = {
  nid: string;
  dob: string;
}

export default function RegisterStep1() {
  const router = useRouter();
  const [formData, setFormData] = useState<Step1FormData>({
    nid: '',
    dob: ''
  });
  const [error, setError] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifyNID = async () => {
    try {
      const formattedDob = `${formData.dob}T00:00:00.000Z`;
      
      const res = await fetch(`/api/auth/verify-nid?nid=${formData.nid}&dob=${formattedDob}`);
      const data = await res.json();
      
      if (res.ok) {
        setVerificationData(data);
        setIsVerified(true);
        setError('');
        
        sessionStorage.setItem('verifiedData', JSON.stringify({
          nid: formData.nid,
          dob: formData.dob,
          name: data.name
        }));
      } else {
        setError(data.message);
        setIsVerified(false);
      }
    } catch (error) {
      setError('Error verifying NID');
      setIsVerified(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Step 1: NID Verification</h2>
          <p className="mt-2 text-gray-600">Enter your National ID Number and Date of Birth</p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <input
              type="text"
              required
              placeholder="National ID Number"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setFormData({...formData, nid: e.target.value})}
            />

            <input
              type="date"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
            />

            <button
              type="button"
              onClick={handleVerifyNID}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Verify
            </button>

            {isVerified && verificationData && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Verified Details:</h3>
                <p className="text-green-700">Name: {verificationData.name}</p>
                <p className="text-green-700">
                  Date of Birth: {verificationData.dob}
                </p>
              </div>
            )}
          </div>

          {isVerified && (
            <button
              onClick={() => router.push('/auth/register/step2')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Proceed to Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 