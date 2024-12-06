'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Step2FormData = {
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterStep2() {
  const router = useRouter();
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [formData, setFormData] = useState<Step2FormData>({
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const savedData = sessionStorage.getItem('verifiedData');
    if (!savedData) {
      router.push('/auth/register/step1');
      return;
    }
    try {
      const parsedData = JSON.parse(savedData);
      console.log('Loaded verified data:', parsedData); // Debug log
      setVerifiedData(parsedData);
    } catch (error) {
      console.error('Error parsing verified data:', error);
      router.push('/auth/register/step1');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate all required fields
    if (!formData.phone || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    try {
      // Ensure verifiedData exists
      if (!verifiedData) {
        setError('Verification data is missing. Please verify your NID again.');
        return;
      }

      const registrationData = {
        nid: verifiedData.nid,
        name: verifiedData.name,
        dob: verifiedData.dob,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      };

      console.log('Sending registration data:', registrationData); // Debug log

      const res = await fetch('/api/auth/register/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData),
      });
      
      const data = await res.json();
      console.log('Registration response:', data); // Debug log
      
      if (res.ok) {
        sessionStorage.removeItem('verifiedData');
        router.push('/auth/login?registered=true');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Step 2: Complete Registration</h2>
          <p className="mt-2 text-gray-600">Complete your profile</p>
        </div>

        {verifiedData ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">Verified Details:</h3>
                <p className="text-gray-700">Name: {verifiedData.name}</p>
                <p className="text-gray-700">NID: {verifiedData.nid}</p>
                <p className="text-gray-700">Date of Birth: {verifiedData.dob}</p>
              </div>
              
              <input
                type="tel"
                required
                placeholder="Phone Number"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />

              <input
                type="email"
                required
                placeholder="Email Address"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              
              <input
                type="password"
                required
                placeholder="Password"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              
              <input
                type="password"
                required
                placeholder="Confirm Password"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Complete Registration
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-red-500">No verification data found. Please complete step 1 first.</p>
          </div>
        )}
      </div>
    </div>
  );
} 