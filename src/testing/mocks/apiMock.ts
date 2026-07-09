export const createGenericApiMock = (globalFetch: typeof fetch) => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    return {
        mockSuccess: (data: object, status = 200) => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status,
                json: async () => data,
            });
        },
        mockFailOver: (status = 500, statusText = "Internal Server Error") => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status,
                statusText,
                json: async () => ({ error: statusText }),
            });
        },
        mockNetworkCrash: () => {
            mockFetch.mockRejectedValueOnce(new Error("Network Error"));
        },
        clear: () => {
            mockFetch.mockClear();
        },
    };
};
