import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import { telemetry } from "@/services/telemetry";

interface Props {
    domain: string;
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class DomainErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[DomainErrorBoundary:${this.props.domain}]`, error, errorInfo);
        telemetry.logError(error, `Domain:${this.props.domain}`);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload(); // Hard reload for safety, or just reset state
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 h-full flex items-center justify-center">
                    <Alert variant="destructive" className="max-w-md border-2">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="text-lg font-bold mb-2">
                            System Module Error ({this.props.domain})
                        </AlertTitle>
                        <AlertDescription className="space-y-4">
                            <p>
                                An unexpected error occurred in the <strong>{this.props.domain}</strong> domain.
                                Our team has been notified.
                            </p>
                            <div className="text-xs font-mono bg-background/20 p-2 rounded overflow-auto max-h-32">
                                {this.state.error?.message}
                            </div>
                            <Button onClick={this.handleRetry} variant="outline" className="w-full">
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Reload Application
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            );
        }

        return this.props.children;
    }
}
