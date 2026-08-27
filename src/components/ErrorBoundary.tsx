import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): React.ReactNode {
    const state = (this as any).state as State;
    const props = (this as any).props as Props;

    if (state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#131315] border border-[#1F1F21] p-8 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">System Encountered an Error</h2>
            <p className="text-xs text-gray-400">
              The application caught an unexpected client runtime exception. You can reload the page to restore normal operation.
            </p>

            {state.error && (
              <div className="bg-[#0A0A0B] p-3 rounded-xl border border-[#262629] text-[11px] font-mono text-red-400 text-left overflow-x-auto max-h-32">
                {state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#C5A059]/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return props.children;
  }
}
