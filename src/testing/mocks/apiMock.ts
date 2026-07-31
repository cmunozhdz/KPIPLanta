import { vi } from 'vitest';

export const createGenericApiMock = (globalFetch: typeof fetch) => {
    const mockFetch = vi.fn();
    globalThis.fetch = mockFetch as any;

    return {
        mockSuccess: (data: object, status = 200) => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status,
                json: async () => data,
            } as any);
        },
        mockFailOver: (status = 500, statusText = "Internal Server Error") => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status,
                statusText,
                json: async () => ({ error: statusText }),
            } as any);
        },
        mockNetworkCrash: () => {
            mockFetch.mockRejectedValueOnce(new Error("Network Error"));
        },
        clear: () => {
            mockFetch.mockClear();
        },
    };
};
