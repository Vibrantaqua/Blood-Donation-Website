import React from 'react';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';

export interface Camp {
  id: string;
  organizerId: string;
  title: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  slotInterval: number;
  slotCapacity: number;
  slots: Array<{
    start: string;
    end: string;
    booked: boolean;
    donorId?: string;
  }>;
}

interface CampCardProps {
  camp: Camp;
  onRegister?: (campId: string) => void;
  isRegistered?: boolean;
  userToken?: string;
  userSlot?: string;
  loading?: boolean;
}

export default function CampCard({ 
  camp, 
  onRegister, 
  isRegistered = false, 
  userToken, 
  userSlot,
  loading = false 
}: CampCardProps) {
  const availableSlots = camp.slots.filter(slot => !slot.booked).length;
  const totalSlots = camp.slots.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{camp.title}</h3>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{availableSlots}/{totalSlots}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3 text-gray-600">
          <MapPin className="w-5 h-5 text-gray-400" />
          <span>{camp.venue}</span>
        </div>
        
        <div className="flex items-center space-x-3 text-gray-600">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span>{formatDate(camp.date)}</span>
        </div>
        
        <div className="flex items-center space-x-3 text-gray-600">
          <Clock className="w-5 h-5 text-gray-400" />
          <span>{camp.startTime} - {camp.endTime}</span>
        </div>
      </div>

      {isRegistered && userToken && userSlot && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">You're registered!</p>
              <p className="text-sm text-green-600">Token: #{userToken}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">Your slot:</p>
              <p className="text-sm font-medium text-green-800">{userSlot}</p>
            </div>
          </div>
        </div>
      )}

      {availableSlots === 0 && !isRegistered && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-yellow-800 text-center">
          <p className="font-medium">This camp is fully booked. Please check back later or choose another camp.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((totalSlots - availableSlots) / totalSlots) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {totalSlots - availableSlots} of {totalSlots} slots filled
          </p>
        </div>

        {onRegister && !isRegistered && (
          <button
            onClick={() => onRegister(camp.id)}
            disabled={loading || availableSlots === 0}
            className="ml-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Registering...' : availableSlots === 0 ? 'Full' : 'Register'}
          </button>
        )}
      </div>
    </div>
  );
}