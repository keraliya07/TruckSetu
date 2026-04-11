import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock } from 'lucide-react';

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
              <p className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600">Analyst onboarding</p>
              <h2 className="mt-3 font-heading text-3xl bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">Add analyst in one place</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                This page is only for creating new analyst accounts. To view analyst details or manage
                access, use Analyst Management.
              </p>
            </div>

            <Link className="btn-secondary" to="/admin/analysts">
              Open analyst management
            </Link>
          </div>

          <form className="mt-8 grid gap-6 md:grid-cols-2" onSubmit={handleCreateAnalyst}>
            <label className="space-y-1 block group">
              <span className="text-sm font-medium text-slate-700 transition-colors group-focus-within:text-freight-600">Analyst name</span>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-freight-500 transition-colors duration-300">
                  <User size={18} />
                </div>
                <input
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:border-freight-500 focus:ring-4 focus:ring-freight-500/10 shadow-sm"
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
              </div>
            </label>

            <label className="space-y-1 block group">
              <span className="text-sm font-medium text-slate-700 transition-colors group-focus-within:text-freight-600">Email address</span>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-freight-500 transition-colors duration-300">
                  <Mail size={18} />
                </div>
                <input
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:border-freight-500 focus:ring-4 focus:ring-freight-500/10 shadow-sm"
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
              </div>
            </label>

            <label className="space-y-1 block group">
              <span className="text-sm font-medium text-slate-700 transition-colors group-focus-within:text-freight-600">Phone number</span>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-freight-500 transition-colors duration-300">
                  <Phone size={18} />
                </div>
                <input
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:border-freight-500 focus:ring-4 focus:ring-freight-500/10 shadow-sm"
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
              </div>
            </label>

            <label className="space-y-1 block group">
              <span className="text-sm font-medium text-slate-700 transition-colors group-focus-within:text-freight-600">Password</span>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-freight-500 transition-colors duration-300">
                  <Lock size={18} />
                </div>
                <input
                  className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:border-freight-500 focus:ring-4 focus:ring-freight-500/10 shadow-sm"
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
              </div>
            </label>

            <div className="md:col-span-2 mt-6 flex justify-center">
              <button 
                className="btn-primary px-10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0" 
                disabled={isCreatingAnalyst} 
                type="submit"
              >
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
