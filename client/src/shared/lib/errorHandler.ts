export interface ErrorResponse {
    message: string;
    statusCode?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleApiError = (error: any): string => {
    if (!error) return "An unknown error occurred";

    if ('status' in error) {
        // FetchBaseQueryError
        const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);
        return (error.data as any)?.message || errMsg || "Server Error";
    }

    // SerializedError
    return error.message || "Unknown Error";
};
