import React from 'react';
import { User, Hash, Clock, X } from 'lucide-react';

interface Registration {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  token: string;
  slotStart: string;
  slotEnd: string;
  status: string;
}

interface RegistrationListProps {
  registrations: Registration[];
  onCancel?: (registrationId: string) => void;
  loading?: boolean;
}

export default function RegistrationList({ registrations, onCancel, loading = false }: RegistrationListProps) {
  if (registrations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
        <p className="text-gray-500">Donors will appear here once they register for this camp.</p>
      </div>
    );
  }

  const activeRegistrations = registrations.filter(reg => reg.status !== 'cancelled');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Registered Donors ({activeRegistrations.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {registrations.map((registration) => (
          <div
            key={registration.id}
            className={`bg-white border rounded-lg p-4 ${
              registration.status === 'cancelled' 
                ? 'border-gray-200 bg-gray-50' 
                : 'border-gray-200 hover:border-red-200'
            } transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      registration.status === 'cancelled' ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {registration.donorName}
                    </h4>
                    <p className="text-sm text-gray-500">{registration.donorEmail}</p>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className={`font-mono text-sm ${
                          registration.status === 'cancelled' ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {registration.token}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Token</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${
                          registration.status === 'cancelled' ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {registration.slotStart} - {registration.slotEnd}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Time Slot</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {registration.status === 'cancelled' ? (
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Cancelled
                  </span>
                </div>
              ) : onCancel ? (
                <button
                  onClick={() => onCancel(registration.id)}
                  disabled={loading}
                  className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Cancel registration"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}