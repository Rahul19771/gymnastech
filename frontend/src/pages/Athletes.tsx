import React, { useEffect, useMemo, useState } from 'react';
import { athletesAPI } from '../services/api';
import type { Athlete } from '../types';
import { useAuthStore } from '../stores/authStore';
import { PlusCircle } from 'lucide-react';

const initialFormState = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  country: '',
  club: '',
  registration_number: ''
};

export const Athletes: React.FC = () => {
  const { user } = useAuthStore();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const canManage = useMemo(
    () => user && (user.role === 'admin' || user.role === 'official'),
    [user]
  );

  useEffect(() => {
    const loadAthletes = async () => {
      try {
        const { data } = await athletesAPI.getAll();
        setAthletes(data.athletes);
      } catch (err) {
        console.error(err);
        setError('Failed to load athletes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAthletes();
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canManage || !formData.first_name.trim() || !formData.last_name.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: formData.date_of_birth || undefined,
        country: formData.country || undefined,
        club: formData.club || undefined,
        registration_number: formData.registration_number || undefined
      };

      const { data } = await athletesAPI.create(payload);
      setAthletes((prev) => [data.athlete, ...prev]);
      setFormData(initialFormState);
    } catch (err) {
      console.error(err);
      setError('Failed to add athlete. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-12 text-gray-600">Loading athletes...</div>
      );
    }

    if (athletes.length === 0) {
      return (
        <div className="text-center py-12 text-gray-600">
          No athletes have been added yet.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Club
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date of Birth
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {athletes.map((athlete) => (
              <tr key={athlete.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {athlete.first_name} {athlete.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                  {athlete.country || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {athlete.club || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {athlete.registration_number || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {athlete.date_of_birth
                    ? new Date(athlete.date_of_birth).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Athletes</h1>
          <p className="text-gray-600 mt-1">
            Manage the athletes competing in your GymnaTech events.
          </p>
        </div>
        {canManage && (
          <div className="inline-flex items-center space-x-2 text-primary-600 font-semibold">
            <PlusCircle className="w-5 h-5" />
            <span>Add athletes directly from this page</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {canManage ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country (ISO code)
            </label>
            <input
              type="text"
              name="country"
              maxLength={3}
              value={formData.country}
              onChange={handleInputChange}
              className="mt-1 block w-full uppercase rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="USA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Club
            </label>
            <input
              type="text"
              name="club"
              value={formData.club}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Add Athlete'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          You can view the athlete roster, but only admins or officials can add
          new athletes.
        </div>
      )}

      {renderTable()}
    </div>
  );
};



