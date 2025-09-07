import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface CreateCampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campData: {
    title: string;
    venue: string;
    date: string;
    startTime: string;
    endTime: string;
    slotInterval: number;
    slotCapacity: number;
  }) => void;
  loading?: boolean;
}

export default function CreateCampModal({ isOpen, onClose, onSubmit, loading = false }: CreateCampModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    date: '',
    startTime: '',
    endTime: '',
    slotInterval: 15,
    slotCapacity: 5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate slot capacity
    if (formData.slotCapacity <= 0) {
      alert('Slot capacity must be greater than 0');
      return;
    }
    // Validate time range
    const start = new Date(`2000-01-01 ${formData.startTime}`);
    const end = new Date(`2000-01-01 ${formData.endTime}`);
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'slotInterval' || name === 'slotCapacity' ? parseInt(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Camp</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Camp Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., Community Blood Drive 2024"
            />
          </div>

          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Venue
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              required
              value={formData.venue}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., City Community Center, Main Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                required
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="slotInterval" className="block text-sm font-medium text-gray-700 mb-2">
                Slot Interval (minutes)
              </label>
              <select
                id="slotInterval"
                name="slotInterval"
                value={formData.slotInterval}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>

            <div>
              <label htmlFor="slotCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Slot Capacity (number of people per slot)
              </label>
              <input
                type="number"
                id="slotCapacity"
                name="slotCapacity"
                required
                min={1}
                value={formData.slotCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., 5"
              />
              {formData.slotCapacity <= 0 && (
                <p className="text-red-600 text-sm mt-2">Slot capacity must be greater than 0.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Camp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}