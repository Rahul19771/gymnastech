import React, { useEffect, useState } from 'react';
import { configAPI, apparatusAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Dumbbell, ScrollText, AlertCircle } from 'lucide-react';

export const Configuration: React.FC = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'rules' | 'apparatus'>('rules');
    const [loading, setLoading] = useState(true);
    const [rules, setRules] = useState<any[]>([]);
    const [apparatusList, setApparatusList] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'rules') {
                const { data } = await configAPI.getScoringRules();
                setRules(data.rules);
            } else {
                const { data } = await apparatusAPI.getAll();
                setApparatusList(data.apparatus);
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
            setMessage({ type: 'error', text: 'Failed to load configuration data' });
        } finally {
            setLoading(false);
        }
    };

    /*
  const handleRuleUpdate = async (ruleId: number, updatedRules: any) => {
    try {
      await configAPI.updateScoringRule(ruleId, { rules: updatedRules });
      setMessage({ type: 'success', text: 'Scoring rule updated successfully' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update scoring rule' });
    }
  };
  */

    if (!user || user.role !== 'admin') {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
                <p className="text-gray-600 mt-1">Manage system settings and scoring rules</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center space-x-2 ${activeTab === 'rules'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <ScrollText className="w-4 h-4" />
                            <span>Scoring Rules</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('apparatus')}
                            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center space-x-2 ${activeTab === 'apparatus'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Dumbbell className="w-4 h-4" />
                            <span>Apparatus</span>
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {message && (
                        <div className={`mb-4 p-4 rounded-lg flex items-start space-x-2 ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{message.text}</span>
                            <button
                                onClick={() => setMessage(null)}
                                className="ml-auto text-sm font-medium hover:underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading configuration...</p>
                        </div>
                    ) : activeTab === 'rules' ? (
                        <div className="space-y-6">
                            {rules.map((rule) => (
                                <div key={rule.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                                            <p className="text-sm text-gray-500">Version: {rule.ruleset_version}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {rule.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">D-Score Rules</h4>
                                            <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                                                {JSON.stringify(rule.rules.d_score, null, 2)}
                                            </pre>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">E-Score Rules</h4>
                                            <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                                                {JSON.stringify(rule.rules.e_score, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {rules.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No scoring rules found.</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {apparatusList.map((app) => (
                                <div key={app.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{app.code}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{app.description}</p>
                                    <div className="text-xs text-gray-500">
                                        Discipline: <span className="capitalize">{app.discipline.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            ))}
                            {apparatusList.length === 0 && (
                                <p className="text-center text-gray-500 py-8 col-span-full">No apparatus found.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
