import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetData = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error(e);
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 font-sans select-none">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Something went wrong</h2>
                <p className="text-xs text-zinc-400 font-mono">App encountered a display error</p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-red-400 break-all max-h-40 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetData}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Cache & Restore Factory Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
