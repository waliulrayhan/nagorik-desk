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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl space-y-8 border border-gray-100">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Step 1: Verification</h2>
          <p className="mt-3 text-lg text-gray-600">Enter your National ID Number and Date of Birth</p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="nid" className="block text-sm font-medium text-gray-700 mb-1">
                National ID Number
              </label>
              <input
                id="nid"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter your NID number"
                onChange={(e) => setFormData({...formData, nid: e.target.value})}
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyNID}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition duration-200"
            >
              Verify Identity
            </button>

            {isVerified && verificationData && (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-sm">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Verified Details</h3>
                <div className="space-y-2">
                  <p className="text-green-700 flex items-center">
                    <span className="font-medium mr-2">Name:</span>
                    {verificationData.name}
                  </p>
                  <p className="text-green-700 flex items-center">
                    <span className="font-medium mr-2">Date of Birth:</span>
                    {verificationData.dob}
                  </p>
                </div>
              </div>
            )}
          </div>

          {isVerified && (
            <button
              onClick={() => router.push('/auth/register/step2')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition duration-200"
            >
              Continue to Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}