import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface ScoringRuleFormProps {
    initialData?: any;
    apparatusList: any[];
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
}

export const ScoringRuleForm: React.FC<ScoringRuleFormProps> = ({
    initialData,
    apparatusList,
    onSave,
    onCancel
}) => {
    const defaultRulesTemplate = {
        d_score: {
            max_elements: 8,
            includes_dismount: true,
            connection_value: true,
            composition_requirements: {
                count: 5,
                value: 2.0
            }
        },
        e_score: {
            starting_value: 10.0,
            judge_count: 4,
            drop_high_low: true,
            deduction_categories: [
                { name: 'execution', max: 10.0 },
                { name: 'artistry', max: 10.0 },
                { name: 'composition', max: 0.5 }
            ]
        },
        neutral_deductions: [
            { name: 'out_of_bounds', values: [0.1, 0.3] },
            { name: 'time_violation', value: 0.1 },
            { name: 'coach_assistance', value: 0.5 }
        ]
    };

    const [formData, setFormData] = useState({
        name: '',
        discipline: 'womens_artistic',
        apparatus_id: '',
        ruleset_version: '',
        effective_from: '',
        effective_until: '',
        rules: JSON.stringify(defaultRulesTemplate, null, 2)
    });
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                discipline: initialData.discipline || 'womens_artistic',
                apparatus_id: initialData.apparatus_id || '',
                ruleset_version: initialData.ruleset_version || '',
                effective_from: initialData.effective_from ? initialData.effective_from.split('T')[0] : '',
                effective_until: initialData.effective_until ? initialData.effective_until.split('T')[0] : '',
                rules: JSON.stringify(initialData.rules || {}, null, 2)
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            // Validate JSON
            let parsedRules;
            try {
                parsedRules = JSON.parse(formData.rules);
            } catch (e) {
                throw new Error('Invalid JSON in Rules field');
            }

            const submissionData = {
                ...formData,
                apparatus_id: formData.apparatus_id ? Number(formData.apparatus_id) : null,
                rules: parsedRules,
                effective_from: formData.effective_from || null,
                effective_until: formData.effective_until || null
            };

            await onSave(submissionData);
        } catch (err: any) {
            setError(err.message || 'Failed to save scoring rule');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {initialData ? 'Edit Scoring Rule' : 'Create Scoring Rule'}
                    </h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
                            <select
                                name="discipline"
                                value={formData.discipline}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="womens_artistic">Women's Artistic</option>
                                <option value="mens_artistic">Men's Artistic</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apparatus</label>
                            <select
                                name="apparatus_id"
                                value={formData.apparatus_id}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="">-- Select Apparatus --</option>
                                {apparatusList.map(app => (
                                    <option key={app.id} value={app.id}>{app.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ruleset Version</label>
                            <input
                                type="text"
                                name="ruleset_version"
                                value={formData.ruleset_version}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
                            <input
                                type="date"
                                name="effective_from"
                                value={formData.effective_from}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Until</label>
                            <input
                                type="date"
                                name="effective_until"
                                value={formData.effective_until}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rules Configuration (JSON)
                            <span className="text-xs text-gray-500 ml-2">Must be valid JSON</span>
                        </label>
                        <textarea
                            name="rules"
                            value={formData.rules}
                            onChange={handleChange}
                            rows={10}
                            className="w-full font-mono text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Rule
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
