'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('/concert-default.jpg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    artist: '',
    price: '',
    totalSeats: '',
    image: '/concert-default.jpg'
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          totalSeats: parseInt(formData.totalSeats),
          availableSeats: parseInt(formData.totalSeats),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      router.push('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/admin/events/create');
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#C2185B] via-[#7B1FA2] to-[#4527A0] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-white dark:text-slate-50 mb-8">Create New Event</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-white/80 dark:text-slate-300 mb-2">
                Event Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Event preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Choose Image
                  </button>
                  <p className="mt-2 text-sm text-white/60 dark:text-slate-400">
                    Recommended size: 800x600px. Max file size: 2MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white/80 dark:text-slate-300 mb-2">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white/80 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-white/80 dark:text-slate-300 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-white/80 dark:text-slate-300 mb-2">
                Date and Time
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
              />
            </div>

            <div>
              <label htmlFor="artist" className="block text-sm font-medium text-white/80 dark:text-slate-300 mb-2">
                Artist/Performer
              </label>
              <input
                type="text"
                id="artist"
                name="artist"
                required
                value={formData.artist}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-white/80 dark:text-slate-300 mb-2">
                Price (IDR)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="1000"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
              />
            </div>

            <div>
              <label htmlFor="totalSeats" className="block text-sm font-medium text-white/80 dark:text-slate-300 mb-2">
                Total Seats
              </label>
              <input
                type="number"
                id="totalSeats"
                name="totalSeats"
                required
                min="1"
                value={formData.totalSeats}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 