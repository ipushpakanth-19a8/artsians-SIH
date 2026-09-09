import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KALAtech Uncaught Runtime Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      localStorage.removeItem('kalatech_auth');
      localStorage.removeItem('kalatech_token');
      localStorage.removeItem('kalatech_language');
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-xl w-full bg-stone-800 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-300">Application Error Encountered</h2>
                <p className="text-xs text-stone-400">KALAtech recovered from an unexpected client exception</p>
              </div>
            </div>

            <p className="text-sm text-stone-300 mb-4 leading-relaxed">
              A component error prevented this view from rendering normally. You can reload the page or reset cached session data to continue.
            </p>

            {this.state.error && (
              <div className="bg-stone-950 border border-stone-700 rounded-xl p-3.5 mb-5 font-mono text-xs text-red-400 overflow-x-auto max-h-48 whitespace-pre-wrap">
                <span className="font-bold text-red-300">Error: </span>
                {this.state.error.message || String(this.state.error)}
                {this.state.error.stack && (
                  <div className="mt-2 text-[10px] text-stone-400 border-t border-stone-800 pt-2 opacity-80">
                    {this.state.error.stack.split('\n').slice(0, 6).join('\n')}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all shadow-md active:scale-98"
              >
                ↻ Reload Application
              </button>
              <button
                onClick={this.handleResetAndReload}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-semibold text-sm transition-all active:scale-98"
              >
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
