import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import CreateCampModal from '../components/CreateCampModal';
import RegistrationList from '../components/RegistrationList';
import { Camp } from '../components/CampCard';
import { Plus, Calendar, MapPin, Clock, Users, X } from 'lucide-react';

interface CampWithRegistrations extends Camp {
  registrations: Array<{
    id: string;
    donorId: string;
    donorName: string;
    donorEmail: string;
    token: string;
    slotStart: string;
    slotEnd: string;
    status: string;
  }>;
}

export default function OrganizerDashboard() {
  const [camps, setCamps] = useState<CampWithRegistrations[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  
  const { userData } = useAuth();

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
    if (!userData) return;
    
    setLoading(true);
    try {
      // Load camps
      const campsRef = collection(db, 'camps');
      const campsQuery = query(campsRef, where('organizerId', '==', userData.uid));
      const campsSnapshot = await getDocs(campsQuery);
      
      const campsData = await Promise.all(
        campsSnapshot.docs.map(async (campDoc) => {
          const campData = { id: campDoc.id, ...campDoc.data() } as Camp;
          
          // Load registrations for this camp
          const registrationsRef = collection(db, 'registrations');
          const regQuery = query(registrationsRef, where('campId', '==', campDoc.id));
          const regSnapshot = await getDocs(regQuery);
          
          const registrations = await Promise.all(
            regSnapshot.docs.map(async (regDoc) => {
              const regData = regDoc.data();
              
              // Get donor info
              const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', regData.donorId)));
              const donorData = userDoc.docs[0]?.data();
              
              return {
                id: regDoc.id,
                donorId: regData.donorId,
                donorName: donorData?.name || 'Unknown',
                donorEmail: donorData?.email || 'Unknown',
                token: regData.token,
                slotStart: regData.slotStart,
                slotEnd: regData.slotEnd,
                status: regData.status
              };
            })
          );
          
          return {
            ...campData,
            registrations
          } as CampWithRegistrations;
        })
      );
      
      setCamps(campsData);
    } catch (error) {
      console.error('Error loading camps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCamps();
  }, [userData]);

  const handleCreateCamp = async (campData: any) => {
    if (!userData) return;
    setCreateLoading(true);
    try {
      const slots = generateSlots(
        campData.startTime, 
        campData.endTime, 
        campData.slotInterval, 
        campData.slotCapacity
      );
      console.log('Creating camp with slots:', slots, 'Camp data:', campData);
      const campId = `camp_${Date.now()}_${userData.uid}`;
      await setDoc(doc(db, 'camps', campId), {
        organizerId: userData.uid,
        title: campData.title,
        venue: campData.venue,
        date: campData.date,
        startTime: campData.startTime,
        endTime: campData.endTime,
        slotInterval: campData.slotInterval,
        slotCapacity: campData.slotCapacity,
        slots: slots
      });
      setModalOpen(false);
      await loadCamps();
    } catch (error) {
      console.error('Error creating camp:', error);
      alert('Failed to create camp. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteCamp = async (campId: string) => {
    if (!confirm('Are you sure you want to delete this camp? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete all registrations for this camp
      const camp = camps.find(c => c.id === campId);
      if (camp && camp.registrations.length > 0) {
        await Promise.all(
          camp.registrations.map(reg => deleteDoc(doc(db, 'registrations', reg.id)))
        );
      }

      // Delete the camp
      await deleteDoc(doc(db, 'camps', campId));
      await loadCamps();
    } catch (error) {
      console.error('Error deleting camp:', error);
      alert('Failed to delete camp. Please try again.');
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      await updateDoc(doc(db, 'registrations', registrationId), {
        status: 'cancelled'
      });
      await loadCamps();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      alert('Failed to cancel registration. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalRegistrations = camps.reduce((sum, camp) => 
    sum + camp.registrations.filter(r => r.status !== 'cancelled').length, 0
  );

  if (loading) {
    return (
      <Layout title="Organizer Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Organizer Dashboard">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Camps</p>
                <p className="text-2xl font-semibold text-gray-900">{camps.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-semibold text-gray-900">{totalRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-sm">%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Fill Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {camps.length > 0 
                    ? Math.round(camps.reduce((sum, camp) => {
                        const filled = camp.registrations.filter(r => r.status !== 'cancelled').length;
                        const total = camp.slots.length;
                        return sum + (total > 0 ? (filled / total) * 100 : 0);
                      }, 0) / camps.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Camp Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">My Camps</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Camp
          </button>
        </div>

        {/* Camps List */}
        {camps.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No camps yet</h3>
            <p className="text-gray-500 mb-6">Create your first blood donation camp to get started.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Camp
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {camps.map((camp) => {
              const activeRegistrations = camp.registrations.filter(r => r.status !== 'cancelled');
              const totalSlots = camp.slots.length;
              const fillRate = totalSlots > 0 ? (activeRegistrations.length / totalSlots) * 100 : 0;

              return (
                <div key={camp.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{camp.title}</h4>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{camp.venue}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(camp.date)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{camp.startTime} - {camp.endTime}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{activeRegistrations.length}/{totalSlots}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Fill Rate</p>
                          <p className="text-lg font-semibold text-gray-900">{Math.round(fillRate)}%</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCamp(camp.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete camp"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <RegistrationList
                      registrations={camp.registrations}
                      onCancel={handleCancelRegistration}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Camp Modal */}
        <CreateCampModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateCamp}
          loading={createLoading}
        />
      </div>
    </Layout>
  );
}