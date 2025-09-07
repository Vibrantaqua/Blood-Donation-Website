import React from 'react';
import CampCard, { Camp } from './CampCard';
import { Loader } from 'lucide-react';

interface CampListProps {
  camps: Camp[];
  loading?: boolean;
  onRegister?: (campId: string) => void;
  registrations?: Array<{
    campId: string;
    token: string;
    slotStart: string;
    slotEnd: string;
  }>;
  registrationLoading?: boolean;
}

export default function CampList({ 
  camps, 
  loading = false, 
  onRegister, 
  registrations = [],
  registrationLoading = false 
}: CampListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading camps...</p>
        </div>
      </div>
    );
  }

  if (camps.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2m-1 0V7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No camps available</h3>
        <p className="text-gray-500">Check back later for new donation camps in your area.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {camps.map((camp) => {
        const registration = registrations.find(reg => reg.campId === camp.id);
        const isRegistered = !!registration;
        
        return (
          <CampCard
            key={camp.id}
            camp={camp}
            onRegister={onRegister}
            isRegistered={isRegistered}
            userToken={registration?.token}
            userSlot={registration ? `${registration.slotStart} - ${registration.slotEnd}` : undefined}
            loading={registrationLoading}
          />
        );
      })}
    </div>
  );
}