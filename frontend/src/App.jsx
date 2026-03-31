import { Link, Route, Routes } from 'react-router-dom';

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            STLOS
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Smart Truck Loading Optimization System
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            The project scaffold is now wired with valid startup files, package
            manifests, and health endpoints so we can iterate from a stable
            base.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Backend</h2>
            <p className="mt-2 text-sm text-slate-300">
              Available at <code>/api/health</code> after starting the server.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">ML Service</h2>
            <p className="mt-2 text-sm text-slate-300">
              Available at <code>/health</code> and <code>/docs</code> after
              starting FastAPI.
            </p>
          </div>
        </div>

        <Link
          className="inline-flex rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
          to="/status"
        >
          View Project Status
        </Link>
      </div>
    </main>
  );
}

function StatusPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <h1 className="text-3xl font-semibold">Project Status</h1>
        <p className="text-slate-300">
          Frontend, backend, and ML service entrypoints now have valid startup
          implementations. Feature modules remain scaffolded and can be built
          incrementally from here.
        </p>
        <Link className="text-cyan-300 underline underline-offset-4" to="/">
          Back home
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/status" element={<StatusPage />} />
    </Routes>
  );
}
