import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventsAPI, apparatusAPI, scoringAPI } from '../services/api';
import { socketService } from '../services/socket';
import type { Event, Apparatus, LeaderboardEntry } from '../types';
import { Trophy, Medal, Award, ClipboardList } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [apparatus, setApparatus] = useState<Apparatus[]>([]);
  const [selectedApparatus, setSelectedApparatus] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadData();
      socketService.connect();
      const eventIdNum = parseInt(eventId);
      if (!isNaN(eventIdNum)) {
        socketService.joinEvent(eventIdNum);
      }

      socketService.onLeaderboardUpdate((data) => {
        if (!selectedApparatus || data.apparatusId === selectedApparatus) {
          setLeaderboard(data.leaderboard);
        }
      });
    }

    return () => {
      if (eventId) {
        const eventIdNum = parseInt(eventId);
        if (!isNaN(eventIdNum)) {
          socketService.leaveEvent(eventIdNum);
        }
      }
    };
  }, [eventId]);

  useEffect(() => {
    if (selectedApparatus) {
      loadLeaderboard();
    }
  }, [selectedApparatus]);

  const loadData = async () => {
    try {
      const eventIdNum = parseInt(eventId!);
      if (isNaN(eventIdNum)) {
        throw new Error('Invalid event ID');
      }

      const [eventRes, apparatusRes] = await Promise.all([
        eventsAPI.getById(eventIdNum),
        apparatusAPI.getAll('womens_artistic')
      ]);

      setEvent(eventRes.data.event);
      setApparatus(apparatusRes.data.apparatus);

      if (apparatusRes.data.apparatus.length > 0) {
        setSelectedApparatus(apparatusRes.data.apparatus[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    if (!eventId || !selectedApparatus) return;

    try {
      const eventIdNum = parseInt(eventId);
      if (isNaN(eventIdNum)) {
        throw new Error('Invalid event ID');
      }

      const { data } = await scoringAPI.getLeaderboard(eventIdNum, selectedApparatus);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-600">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        {event && (
          <p className="text-gray-600 mt-1">{event.name}</p>
        )}
      </div>

      {/* Apparatus Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {apparatus.map((app) => (
            <button
              key={app.id}
              onClick={() => setSelectedApparatus(app.id)}
              className={`p-4 border-2 rounded-lg font-medium transition-colors ${selectedApparatus === app.id
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
            >
              <div className="text-lg font-bold">{app.code}</div>
              <div className="text-sm">{app.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {leaderboard.length === 0 ? (
          <div className="text-center py-16 bg-white">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Scores Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Scores will appear here as soon as judges submit them for this apparatus.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Athlete
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D-Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry.performance_id}
                    className={`${index < 3 ? 'bg-primary-50/30' : ''} hover:bg-gray-50`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {entry.first_name} {entry.last_name}
                      </div>
                      {entry.club && (
                        <div className="text-sm text-gray-500">{entry.club}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {entry.country || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {Number(entry.d_score).toFixed(3)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {Number(entry.e_score).toFixed(3)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-red-600">
                        {Number(entry.neutral_deductions) > 0 ? `-${Number(entry.neutral_deductions).toFixed(3)}` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-bold text-primary-600">
                        {Number(entry.final_score).toFixed(3)}
                      </span>
                      {entry.is_official && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Official
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


