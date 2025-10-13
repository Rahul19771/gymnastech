import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import type { Event } from '../types';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, BarChart3, Users } from 'lucide-react';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);
  
  const loadEvent = async () => {
    try {
      const { data } = await eventsAPI.getById(parseInt(id!));
      setEvent(data.event);
    } catch (error) {
      console.error('Failed to load event:', error);
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


