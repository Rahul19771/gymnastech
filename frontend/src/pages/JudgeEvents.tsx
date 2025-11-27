import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import type { Event } from '../types';
import { Calendar, MapPin, Clock, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

export const JudgeEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const { data } = await eventsAPI.getAll();
            // Filter to show only scheduled and in_progress events
            const activeEvents = data.events.filter(
                e => e.status === 'scheduled' || e.status === 'in_progress'
            );
            setEvents(activeEvents);
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
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Judge Panel</h1>
                <p className="text-gray-600 mt-1">
                    Select an event to submit scores
                </p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading events...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No active events</h3>
                    <p className="text-gray-600">
                        There are no events available for scoring at the moment
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            to={`/events/${event.id}/judge`}
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

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center text-primary-600 font-medium text-sm">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    <span>Enter Scores</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
