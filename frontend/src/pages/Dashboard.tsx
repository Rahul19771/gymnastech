import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { eventsAPI } from '../services/api';
import type { Event } from '../types';
import { Calendar, MapPin, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadEvents();
  }, []);
  
  const loadEvents = async () => {
    try {
      const { data } = await eventsAPI.getAll();
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
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
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'judge' && 'View upcoming events and submit scores'}
            {user?.role === 'admin' && 'Manage events, athletes, and scoring'}
            {user?.role === 'official' && 'Monitor events and manage results'}
            {user?.role === 'athlete' && 'View your performance and scores'}
            {user?.role === 'public' && 'View live scores and leaderboards'}
          </p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'official') && (
          <Link
            to="/events/new"
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </Link>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600">
            {(user?.role === 'admin' || user?.role === 'official')
              ? 'Create your first event to get started'
              : 'Check back later for upcoming events'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(event.status)}`}>
                  {event.status.replace('_', ' ')}
                </span>
              </div>
              
              {event.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              )}
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                </div>
                
                {event.start_time && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.start_time}</span>
                  </div>
                )}
                
                {event.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};


