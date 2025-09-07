import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar } from 'lucide-react';

export default function RoleSelect() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Welcome to BloodBridge
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting donors with life-saving opportunities. Choose your role to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Link
            to="/login?role=donor"
            className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-red-200"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">I'm a Donor</h3>
              <p className="text-gray-600 mb-6">
                Find nearby blood donation camps, register for slots, and help save lives in your community.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>View donation camps</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Get time slot & token</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Track your donations</span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/login?role=organizer"
            className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-red-200"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">I'm an Organizer</h3>
              <p className="text-gray-600 mb-6">
                Create and manage blood donation camps, coordinate with donors, and make a difference.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Create donation camps</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Manage registrations</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>View donor details</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            New to BloodBridge?{' '}
            <Link to="/signup" className="text-red-600 hover:text-red-500 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}