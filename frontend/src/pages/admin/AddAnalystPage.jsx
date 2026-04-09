import { useState } from 'react';
import { Link } from 'react-router-dom';

import FormFeedback from '../../components/common/FormFeedback';
import DashboardShell from '../../components/common/DashboardShell';
import { createAnalyst } from '../../api/admin.api';

export default function AddAnalystPage() {
  const [analystForm, setAnalystForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [analystFeedback, setAnalystFeedback] = useState('');
  const [analystError, setAnalystError] = useState('');
  const [isCreatingAnalyst, setIsCreatingAnalyst] = useState(false);

  async function handleCreateAnalyst(event) {
    event.preventDefault();

    setIsCreatingAnalyst(true);
    setAnalystFeedback('');
    setAnalystError('');

    try {
      const created = await createAnalyst({
        name: analystForm.name.trim(),
        email: analystForm.email.trim(),
        phone: analystForm.phone.trim(),
        password: analystForm.password,
      });

      setAnalystFeedback(`Analyst account created for ${created.email}.`);
      setAnalystForm({
        name: '',
        email: '',
        phone: '',
        password: '',
      });
    } catch (error) {
      setAnalystError(error.message || 'Failed to create analyst account');
    } finally {
      setIsCreatingAnalyst(false);
    }
  }

  return (
    <DashboardShell
      accent="text-signal-600"
      eyebrow="Admin Control"
      title="Add analyst"
      subtitle="Create a fresh analyst account from a dedicated admin workspace."
    >
      <section className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Analyst onboarding</p>
              <h2 className="mt-2 font-heading text-3xl text-slate-950">Add analyst in one place</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                This page is only for creating new analyst accounts. To view analyst details or manage
                access, use Analyst Management.
              </p>
            </div>

            <Link className="btn-secondary" to="/admin/analysts">
              Open analyst management
            </Link>
          </div>

          <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleCreateAnalyst}>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Analyst name</span>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-freight-500"
                onChange={(event) =>
                  setAnalystForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Enter analyst name"
                required
                type="text"
                value={analystForm.name}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Email address</span>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-freight-500"
                onChange={(event) =>
                  setAnalystForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="analyst@trucksetu.dev"
                required
                type="email"
                value={analystForm.email}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Phone number</span>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-freight-500"
                onChange={(event) =>
                  setAnalystForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="Enter phone number"
                type="text"
                value={analystForm.phone}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-freight-500"
                minLength={8}
                onChange={(event) =>
                  setAnalystForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Minimum 8 characters"
                required
                type="password"
                value={analystForm.password}
              />
            </label>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-600">
                New analysts are created as fresh accounts and can sign in immediately after creation.
              </p>
              <button className="btn-primary" disabled={isCreatingAnalyst} type="submit">
                {isCreatingAnalyst ? 'Creating...' : 'Add analyst'}
              </button>
            </div>
          </form>

          <FormFeedback className="mt-4" message={analystFeedback} tone="success" />
          <FormFeedback className="mt-4" message={analystError} tone="error" />
        </div>
      </section>
    </DashboardShell>
  );
}
