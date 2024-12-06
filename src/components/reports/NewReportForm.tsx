'use client';
import { useState, useEffect } from 'react';
import { Sector, Subsector } from '@prisma/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FormData {
  sectorId: number;
  subsectorId: number;
  description: string;
  images: File[];
}

export default function NewReportForm() {
  const router = useRouter();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    sectorId: 0,
    subsectorId: 0,
    description: '',
    images: [],
  });

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch('/api/sectors');
        if (!response.ok) {
          throw new Error('Failed to fetch sectors');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setSectors(data);
        } else {
          console.error('Invalid sectors data:', data);
          setError('Invalid sectors data received');
        }
      } catch (error) {
        console.error('Error fetching sectors:', error);
        setError('Failed to load sectors. Please refresh the page.');
      }
    };

    fetchSectors();
  }, []);

  const handleSectorChange = async (sectorId: number) => {
    setFormData(prev => ({ ...prev, sectorId, subsectorId: 0 }));
    setSubsectors([]);

    if (sectorId) {
      try {
        const response = await fetch(`/api/sectors/${sectorId}/subsectors`);
        if (!response.ok) {
          throw new Error('Failed to fetch subsectors');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setSubsectors(data);
        } else {
          console.error('Invalid subsectors data:', data);
          setError('Invalid subsectors data received');
        }
      } catch (error) {
        console.error('Error fetching subsectors:', error);
        setError('Failed to load subsectors. Please try again.');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Please only upload images under 5MB.');
      return;
    }

    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.sectorId) {
        throw new Error('Please select a sector');
      }
      if (!formData.subsectorId) {
        throw new Error('Please select a subsector');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }

      const submitData = new FormData();
      submitData.append('sectorId', formData.sectorId.toString());
      submitData.append('subsectorId', formData.subsectorId.toString());
      submitData.append('description', formData.description.trim());
      
      formData.images.forEach((image, index) => {
        submitData.append('images', image);
      });

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      const result = await response.json();
      
      if (result.success) {
        // Clean up preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        
        router.push('/dashboard');
        router.refresh();
      } else {
        throw new Error('Failed to submit report');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report';
      setError(errorMessage);
      console.error('Error submitting report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add cleanup for preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Submit New Report</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sector Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select
              required
              value={formData.sectorId || ''}
              onChange={e => handleSectorChange(Number(e.target.value))}
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">Select a sector</option>
              {sectors.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subsector Selection */}
          {subsectors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subsector</label>
              <select
                required
                value={formData.subsectorId || ''}
                onChange={e => setFormData(prev => ({ ...prev, subsectorId: Number(e.target.value) }))}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">Select a subsector</option>
                {subsectors.map(subsector => (
                  <option key={subsector.id} value={subsector.id}>
                    {subsector.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Describe the issue in detail..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Images (Optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 
                transition-all duration-200"
            />
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Report...
              </span>
            ) : (
              'Submit Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}