export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
}

function authHeaders(): HeadersInit {
    const token = getAuthToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
}

function handleResponse(res: Response) {
    if (res.status === 401) {
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            window.location.href = "/login";
        }
        throw new Error("Unauthorized");
    }

    // Check upgradeRequired inside json
    return res;
}

export const api = {
    get: async (path: string) => {
        const res = await fetch(NEXT_PUBLIC_API_URL + path, {
            headers: authHeaders(),
        });

        handleResponse(res);
        const data = await res.json();
        if (res.status === 403 && data.upgradeRequired) {
            if (typeof window !== "undefined") window.location.href = "/dashboard/billing";
            throw new Error("Upgrade required");
        }
        if (!res.ok) throw new Error(data.message || `API error: ${res.status}`);
        return data;
    },

    post: async (path: string, body: any) => {
        const res = await fetch(NEXT_PUBLIC_API_URL + path, {
            method: "POST",
            headers: {
                ...authHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        handleResponse(res);
        const data = await res.json();
        if (res.status === 403 && data.upgradeRequired) {
            if (typeof window !== "undefined") window.location.href = "/dashboard/billing";
            throw new Error("Upgrade required");
        }
        if (!res.ok) throw new Error(data.message || `API error: ${res.status}`);
        return data;
    },

    put: async (path: string, body: any) => {
        const res = await fetch(NEXT_PUBLIC_API_URL + path, {
            method: "PUT",
            headers: {
                ...authHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        handleResponse(res);
        const data = await res.json();
        if (res.status === 403 && data.upgradeRequired) {
            if (typeof window !== "undefined") window.location.href = "/dashboard/billing";
            throw new Error("Upgrade required");
        }
        if (!res.ok) throw new Error(data.message || `API error: ${res.status}`);
        return data;
    },

    patch: async (path: string, body: any) => {
        const res = await fetch(NEXT_PUBLIC_API_URL + path, {
            method: "PATCH",
            headers: {
                ...authHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        handleResponse(res);
        const data = await res.json();
        if (res.status === 403 && data.upgradeRequired) {
            if (typeof window !== "undefined") window.location.href = "/dashboard/billing";
            throw new Error("Upgrade required");
        }
        if (!res.ok) throw new Error(data.message || `API error: ${res.status}`);
        return data;
    },

    delete: async (path: string) => {
        const res = await fetch(NEXT_PUBLIC_API_URL + path, {
            method: "DELETE",
            headers: authHeaders(),
        });

        handleResponse(res);
        const data = await res.json();
        if (res.status === 403 && data.upgradeRequired) {
            if (typeof window !== "undefined") window.location.href = "/dashboard/billing";
            throw new Error("Upgrade required");
        }
        if (!res.ok) throw new Error(data.message || `API error: ${res.status}`);
        return data;
    },
};
