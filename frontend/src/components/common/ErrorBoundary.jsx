import React from 'react';

const isDev = Boolean(import.meta.env.DEV);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TruckSetu UI render error', error, errorInfo);
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <section className="panel p-6 sm:p-8">
              <p className="font-heading text-sm uppercase tracking-[0.3em] text-rose-600">
                Something Went Wrong
              </p>
              <h1 className="mt-4 font-heading text-4xl text-slate-950">
                The interface hit an unexpected error.
              </h1>
              <p className="mt-3 text-slate-600">
                You can retry this view or jump back to the home screen while we keep the rest
                of the workspace intact.
              </p>

              {isDev && this.state.error ? (
                <pre className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-slate-950 px-4 py-4 text-sm text-slate-100">
                  {this.state.error.stack || this.state.error.message}
                </pre>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="btn-primary" onClick={this.reset} type="button">
                  Try again
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => window.location.assign('/')}
                  type="button"
                >
                  Go home
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => window.location.reload()}
                  type="button"
                >
                  Reload app
                </button>
              </div>
            </section>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
