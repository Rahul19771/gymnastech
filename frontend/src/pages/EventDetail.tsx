import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, athletesAPI, apparatusAPI, scoringAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Event } from '../types';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, BarChart3, Users } from 'lucide-react';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [apparatusList, setApparatusList] = useState<any[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const [selectedApparatus, setSelectedApparatus] = useState<number[]>([]);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  useEffect(() => {
    if (showRegisterModal) {
      loadRegistrationData();
    }
  }, [showRegisterModal]);

  const loadEvent = async () => {
    try {
      const eventId = parseInt(id!);
      if (isNaN(eventId)) {
        throw new Error('Invalid event ID');
      }
      const { data } = await eventsAPI.getById(eventId);
      setEvent(data.event);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrationData = async () => {
    try {
      const [athletesRes, apparatusRes] = await Promise.all([
        athletesAPI.getAll(),
        apparatusAPI.getAll('womens_artistic')
      ]);
      setAthletes(athletesRes.data.athletes);
      setApparatusList(apparatusRes.data.apparatus);
    } catch (error) {
      console.error('Failed to load registration data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || selectedApparatus.length === 0) return;

    setRegistering(true);
    setMessage(null);

    try {
      await eventsAPI.registerAthlete(parseInt(id!), {
        athlete_id: parseInt(selectedAthlete),
        apparatus_ids: selectedApparatus
      });

      // Auto-create performance records for each apparatus
      for (const apparatusId of selectedApparatus) {
        try {
          await scoringAPI.createPerformance({
            event_id: parseInt(id!),
            athlete_id: parseInt(selectedAthlete),
            apparatus_id: apparatusId
          });
        } catch (perfError) {
          console.error('Failed to create performance:', perfError);
          // Continue even if one fails
        }
      }

      setMessage({ type: 'success', text: 'Athlete registered and performances created!' });
      setSelectedAthlete('');
      setSelectedApparatus([]);
      setTimeout(() => setShowRegisterModal(false), 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      setMessage({ type: 'error', text: 'Failed to register athlete' });
    } finally {
      setRegistering(false);
    }
  };

  const toggleApparatus = (appId: number) => {
    setSelectedApparatus(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900">Event not found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <span className={`mt-2 inline-block px-3 py-1 text-sm font-medium rounded ${getStatusColor(event.status)}`}>
              {event.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          {(user?.role === 'admin' || user?.role === 'official') && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Register Athlete</span>
            </button>
          )}
        </div>

        {event.description && (
          <p className="text-gray-600 mt-4">{event.description}</p>
        )}

        <div className="mt-6 space-y-3 text-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-medium">
              {format(new Date(event.event_date), 'MMMM d, yyyy')}
            </span>
          </div>

          {event.start_time && (
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>{event.start_time}</span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Register Athlete</h2>

            {message && (
              <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Athlete</label>
                <select
                  value={selectedAthlete}
                  onChange={(e) => setSelectedAthlete(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">-- Select Athlete --</option>
                  {athletes.map(athlete => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.first_name} {athlete.last_name} ({athlete.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Apparatus</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                  {apparatusList.map(app => (
                    <label key={app.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedApparatus.includes(app.id)}
                        onChange={() => toggleApparatus(app.id)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span>{app.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering || !selectedAthlete || selectedApparatus.length === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {registering ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to={`/events/${id}/leaderboard`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <BarChart3 className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
              <p className="text-gray-600 text-sm">View live scores and rankings</p>
            </div>
          </div>
        </Link>

        <Link
          to={`/events/${id}/judge`}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Judge Panel</h3>
              <p className="text-gray-600 text-sm">Submit scores for performances</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};


