"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SignupPage() {
    const router = useRouter();
    const [orgName, setOrgName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/api/auth/signup", { orgName, name, email, password });
            if (res.success && res.token) {
                // Store JWT and user
                localStorage.setItem("auth_token", res.token);
                localStorage.setItem("auth_user", JSON.stringify(res.user));

                // Also set a cookie for middleware
                document.cookie = `auth_token=${res.token}; path=/; max-age=86400; SameSite=Lax`;

                router.push("/dashboard");
            } else {
                setError(res.message || "Failed to create account");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-4 py-12">
            <div className="max-w-md w-full bg-[#1a1a24] rounded-2xl p-8 border border-white/10 shadow-xl">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create an account</h1>
                    <p className="text-sm text-gray-400">Join SitePilot to start building</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="orgName">
                            Organization / Business Name
                        </label>
                        <input
                            id="orgName"
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                            placeholder="Acme Corp"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="name">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                            placeholder="Jane Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="email">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center mt-6"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Create account"
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <a href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
