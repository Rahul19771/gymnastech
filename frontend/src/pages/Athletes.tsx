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

  const firstNameRef = React.useRef<HTMLInputElement>(null);

  const handleFocusForm = () => {
    firstNameRef.current?.focus();
    firstNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Date helpers
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDateChange = (type: 'year' | 'month' | 'day', value: string) => {
    const currentDob = formData.date_of_birth ? new Date(formData.date_of_birth) : new Date();
    let year = currentDob.getFullYear();
    let month = currentDob.getMonth();
    let day = currentDob.getDate();

    if (formData.date_of_birth) {
      // If exists, parse it
      const [y, m, d] = formData.date_of_birth.split('-').map(Number);
      year = y;
      month = m - 1; // 0-indexed
      day = d;
    } else {
      // Default to something reasonable if empty
      year = 2010;
      month = 0;
      day = 1;
    }

    if (type === 'year') year = parseInt(value);
    if (type === 'month') month = parseInt(value);
    if (type === 'day') day = parseInt(value);

    // Validate day for month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (day > daysInMonth) day = daysInMonth;

    // Format YYYY-MM-DD
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, date_of_birth: formattedDate }));
  };

  // Parse current DOB for controlled inputs
  // Handle timezone issues by splitting string directly if possible, or just use UTC methods if string is YYYY-MM-DD
  // The input type="date" uses YYYY-MM-DD.
  const [dobYear, dobMonth, dobDay] = formData.date_of_birth
    ? formData.date_of_birth.split('-').map(Number)
    : [null, null, null];


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
          <button
            onClick={handleFocusForm}
            className="inline-flex items-center space-x-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add athletes directly from this page</span>
          </button>
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
              ref={firstNameRef}
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
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={dobYear || ''}
                onChange={(e) => handleDateChange('year', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="" disabled>Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={dobMonth !== null ? dobMonth - 1 : ''}
                onChange={(e) => handleDateChange('month', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="" disabled>Month</option>
                {months.map((month, idx) => (
                  <option key={month} value={idx}>{month}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Day"
                value={dobDay || ''}
                onChange={(e) => handleDateChange('day', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
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



