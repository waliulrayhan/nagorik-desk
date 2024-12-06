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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Submit New Report</h1>
      
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sector Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sector</label>
          <select
            required
            value={formData.sectorId || ''}
            onChange={e => handleSectorChange(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700">Subsector</label>
            <select
              required
              value={formData.subsectorId || ''}
              onChange={e => setFormData(prev => ({ ...prev, subsectorId: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Evidence Images (Optional)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Image Previews */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative h-24">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
} 