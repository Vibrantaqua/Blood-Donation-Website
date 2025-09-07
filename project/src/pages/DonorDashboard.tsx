import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, updateDoc, where, deleteField } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import CampList from '../components/CampList';
import { Camp } from '../components/CampCard';
import { Heart, Calendar, MapPin, Hash, Clock } from 'lucide-react';

interface Registration {
  id: string;
  donorId: string;
  campId: string;
  token: string;
  slotStart: string;
  slotEnd: string;
  status: string;
}

export default function DonorDashboard() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  
  const { userData } = useAuth();

  const generateToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const generateSlots = (startTime: string, endTime: string, intervalMinutes: number, capacity: number) => {
    const slots = [];
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    
    let current = start;
    while (current < end) {
      const slotEnd = new Date(current.getTime() + intervalMinutes * 60000);
      if (slotEnd > end) break;
      
      for (let i = 0; i < capacity; i++) {
        slots.push({
          start: current.toTimeString().slice(0, 5),
          end: slotEnd.toTimeString().slice(0, 5),
          booked: false
        });
      }
      
      current = slotEnd;
    }
    
    return slots;
  };

  const loadCamps = async () => {
    try {
      const campsRef = collection(db, 'camps');
      const snapshot = await getDocs(campsRef);
      const campsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Camp));
      
      // Filter out past camps
      const today = new Date().toISOString().split('T')[0];
      const futureCamps = campsData.filter(camp => camp.date >= today);
      
      setCamps(futureCamps);
    } catch (error) {
      console.error('Error loading camps:', error);
    }
  };

  const loadRegistrations = async () => {
    if (!userData) return;
    
    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(registrationsRef, where('donorId', '==', userData.uid));
      const snapshot = await getDocs(q);
      const registrationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Registration));
      
      setRegistrations(registrationsData.filter(reg => reg.status !== 'cancelled'));
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadCamps(), loadRegistrations()]);
      setLoading(false);
    };
    
    loadData();
  }, [userData]);

  const handleRegister = async (campId: string) => {
    if (!userData) return;
    
    setRegistrationLoading(true);
    try {
      // Find the camp
      const camp = camps.find(c => c.id === campId);
      if (!camp) throw new Error('Camp not found');

      // Find first available slot
      const availableSlotIndex = camp.slots.findIndex(slot => !slot.booked);
      if (availableSlotIndex === -1) throw new Error('No slots available');

      const slot = camp.slots[availableSlotIndex];
      const token = generateToken();
      
      // Create registration
      const registrationId = `${userData.uid}_${campId}`;
      await setDoc(doc(db, 'registrations', registrationId), {
        donorId: userData.uid,
        campId: campId,
        token: token,
        slotStart: slot.start,
        slotEnd: slot.end,
        status: 'active'
      });

      // Update camp slot as booked
      const updatedSlots = [...camp.slots];
      updatedSlots[availableSlotIndex] = { ...slot, booked: true, donorId: userData.uid };
      
      await updateDoc(doc(db, 'camps', campId), {
        slots: updatedSlots
      });

      // Refresh data
      await Promise.all([loadCamps(), loadRegistrations()]);
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert('Registration failed: ' + error.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;
    
    try {
      const registration = registrations.find(r => r.id === registrationId);
      if (!registration) return;

      // Update registration status
      await updateDoc(doc(db, 'registrations', registrationId), {
        status: 'cancelled'
      });

      // Find and free up the slot in camp
      const camp = camps.find(c => c.id === registration.campId);
      if (camp) {
        const updatedSlots = camp.slots.map(slot => {
          if (slot.start === registration.slotStart && 
              slot.end === registration.slotEnd && 
              slot.donorId === userData?.uid) {
            return { ...slot, booked: false, donorId: null };
          }
          return slot;
        });
        await updateDoc(doc(db, 'camps', registration.campId), {
          slots: updatedSlots
        });
      }

      // Refresh data
      await Promise.all([loadCamps(), loadRegistrations()]);
      
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert('Cancellation failed. Please try again.');
    }
  };

  return (
    <Layout title="Donor Dashboard">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Registrations</p>
                <p className="text-2xl font-semibold text-gray-900">{registrations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Camps</p>
                <p className="text-2xl font-semibold text-gray-900">{camps.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {registrations.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Registrations */}
        {registrations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">My Active Registrations</h3>
            <div className="grid gap-4">
              {registrations.map((registration) => {
                const camp = camps.find(c => c.id === registration.campId);
                if (!camp) return null;
                
                return (
                  <div key={registration.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{camp.title}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{camp.venue}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(camp.date).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{registration.slotStart} - {registration.slotEnd}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Hash className="w-4 h-4" />
                            <span className="font-mono">#{registration.token}</span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelRegistration(registration.id)}
                        className="ml-4 px-4 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Camps */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Blood Donation Camps</h3>
          <CampList
            camps={camps}
            loading={loading}
            onRegister={handleRegister}
            registrations={registrations.map(reg => ({
              campId: reg.campId,
              token: reg.token,
              slotStart: reg.slotStart,
              slotEnd: reg.slotEnd
            }))}
            registrationLoading={registrationLoading}
          />
        </div>
      </div>
    </Layout>
  );
}