import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { eventsAPI, apparatusAPI, scoringAPI } from '../services/api';
import { socketService } from '../services/socket';
import type { Event, Apparatus, Performance, ScoreSubmission } from '../types';
import { ChevronDown, Save, AlertCircle } from 'lucide-react';

export const JudgePanel: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [apparatus, setApparatus] = useState<Apparatus[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [selectedApparatus, setSelectedApparatus] = useState<number | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  
  const [scoreType, setScoreType] = useState<'d_score' | 'e_score'>('e_score');
  const [scoreValue, setScoreValue] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  useEffect(() => {
    if (eventId) {
      loadData();
      socketService.connect();
      socketService.joinEvent(parseInt(eventId));
      
      socketService.onScoreUpdate(() => {
        loadPerformances();
      });
    }
    
    return () => {
      if (eventId) {
        socketService.leaveEvent(parseInt(eventId));
      }
    };
  }, [eventId]);
  
  useEffect(() => {
    if (selectedApparatus) {
      loadPerformances();
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
      
      // Set apparatus from query params or default to first
      const apparatusParam = searchParams.get('apparatus');
      if (apparatusParam) {
        setSelectedApparatus(parseInt(apparatusParam));
      } else if (apparatusRes.data.apparatus.length > 0) {
        setSelectedApparatus(apparatusRes.data.apparatus[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };
  
  const loadPerformances = async () => {
    if (!eventId || !selectedApparatus) return;
    
    try {
      const eventIdNum = parseInt(eventId);
      if (isNaN(eventIdNum)) {
        throw new Error('Invalid event ID');
      }
      
      const { data } = await scoringAPI.getPerformances(eventIdNum, selectedApparatus);
      setPerformances(data.performances);
    } catch (error) {
      console.error('Failed to load performances:', error);
    }
  };
  
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerformance) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      const submission: ScoreSubmission = {
        performance_id: selectedPerformance.id,
        score_type: scoreType,
        score_value: parseFloat(scoreValue),
        comments: comments || undefined
      };
      
      await scoringAPI.submitScore(submission);
      
      setMessage({ type: 'success', text: 'Score submitted successfully!' });
      setScoreValue('');
      setComments('');
      
      // Reload performances to show updated scores
      await loadPerformances();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to submit score'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Judge Panel</h1>
        {event && (
          <p className="text-gray-600 mt-1">{event.name}</p>
        )}
      </div>
      
      {/* Apparatus Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Apparatus
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {apparatus.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                setSelectedApparatus(app.id);
                setSearchParams({ apparatus: app.id.toString() });
              }}
              className={`p-4 border-2 rounded-lg font-medium transition-colors ${
                selectedApparatus === app.id
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performances List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performances</h2>
          
          {performances.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No performances for this apparatus yet
            </p>
          ) : (
            <div className="space-y-3">
              {performances.map((perf) => (
                <button
                  key={perf.id}
                  onClick={() => setSelectedPerformance(perf)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                    selectedPerformance?.id === perf.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {perf.first_name} {perf.last_name}
                      </div>
                      {perf.country && (
                        <div className="text-sm text-gray-600">{perf.country}</div>
                      )}
                    </div>
                    {perf.final_score !== null && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">
                          {perf.final_score.toFixed(3)}
                        </div>
                        <div className="text-xs text-gray-500">
                          D: {perf.d_score?.toFixed(3)} E: {perf.e_score?.toFixed(3)}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Score Entry Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Score</h2>
          
          {!selectedPerformance ? (
            <div className="text-center py-8 text-gray-600">
              Select a performance to submit a score
            </div>
          ) : (
            <form onSubmit={handleSubmitScore} className="space-y-6">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="font-semibold text-gray-900">
                  {selectedPerformance.first_name} {selectedPerformance.last_name}
                </div>
                <div className="text-sm text-gray-600">{selectedPerformance.apparatus_name}</div>
              </div>
              
              {message && (
                <div className={`p-4 rounded-lg flex items-start space-x-2 ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{message.text}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScoreType('d_score')}
                    className={`p-3 border-2 rounded-lg font-medium ${
                      scoreType === 'd_score'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    D-Score
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreType('e_score')}
                    className={`p-3 border-2 rounded-lg font-medium ${
                      scoreType === 'e_score'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    E-Score
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                  Score Value
                </label>
                <input
                  id="score"
                  type="number"
                  step="0.001"
                  min="0"
                  max="20"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.000"
                />
              </div>
              
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (optional)
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Any notes or observations..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Submit Score'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


