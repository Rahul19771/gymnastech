import React from 'react';
import { Check, X } from 'lucide-react';

interface ScoringRulesDisplayProps {
    rules: any;
}

export const ScoringRulesDisplay: React.FC<ScoringRulesDisplayProps> = ({ rules }) => {
    // Check if rules has the expected structure
    if (!rules || typeof rules !== 'object') {
        return (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
                <p className="font-medium">Invalid rules configuration</p>
                <p className="text-sm mt-1">Rules must be a valid object.</p>
            </div>
        );
    }

    const { d_score, e_score, neutral_deductions } = rules;

    // Check if required properties exist
    if (!d_score || !e_score || !neutral_deductions) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
                <p className="font-medium">Incomplete rules configuration</p>
                <p className="text-sm mt-1">Rules must contain d_score, e_score, and neutral_deductions properties.</p>
                <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">View raw JSON</summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(rules, null, 2)}
                    </pre>
                </details>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* D-Score Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Difficulty Score (D-Score)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Max Elements Counted</span>
                            <span className="font-medium">{d_score.max_elements}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Includes Dismount</span>
                            {d_score.includes_dismount ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : (
                                <X className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Connection Value</span>
                            {d_score.connection_value ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : (
                                <X className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Composition Requirements</h5>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-600">Count</span>
                            <span className="font-medium">{d_score.composition_requirements.count}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Value per Requirement</span>
                            <span className="font-medium">{d_score.composition_requirements.value.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* E-Score Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Execution Score (E-Score)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-md text-center">
                        <span className="block text-xs text-blue-600 uppercase tracking-wide font-semibold">Starting Value</span>
                        <span className="block text-2xl font-bold text-blue-900">{e_score.starting_value.toFixed(1)}</span>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-md text-center">
                        <span className="block text-xs text-purple-600 uppercase tracking-wide font-semibold">Judge Count</span>
                        <span className="block text-2xl font-bold text-purple-900">{e_score.judge_count}</span>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-md text-center flex flex-col justify-center items-center">
                        <span className="block text-xs text-indigo-600 uppercase tracking-wide font-semibold mb-1">Drop High/Low</span>
                        {e_score.drop_high_low ? (
                            <Check className="w-6 h-6 text-indigo-700" />
                        ) : (
                            <X className="w-6 h-6 text-indigo-700" />
                        )}
                    </div>
                </div>

                <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Deduction Categories</h5>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Max Deduction</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {e_score.deduction_categories.map((cat: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">{cat.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{cat.max.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Neutral Deductions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Neutral Deductions</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violation</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deduction Value</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {neutral_deductions.map((nd: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">{nd.name.replace(/_/g, ' ')}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                                        {Array.isArray(nd.values)
                                            ? nd.values.map((v: number) => v.toFixed(1)).join(' / ')
                                            : nd.value?.toFixed(1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
