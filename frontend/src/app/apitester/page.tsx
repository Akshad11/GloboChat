"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type HistoryItem = {
    method: string;
    url: string;
    body: string;
};

export default function ApiTester() {
    const [method, setMethod] = useState("GET");
    const [url, setUrl] = useState("");
    const [body, setBody] = useState("{}");
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load history
    useEffect(() => {
        const saved = localStorage.getItem("api_tester_history");
        if (saved) setHistory(JSON.parse(saved));
    }, []);

    // Save history
    function saveHistory(item: HistoryItem) {
        const updated = [item, ...history.filter(h => h.url !== item.url)].slice(0, 6);
        setHistory(updated);
        localStorage.setItem("api_tester_history", JSON.stringify(updated));
    }

    async function sendRequest() {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await api({
                method,
                url,
                data: body ? JSON.parse(body) : undefined,
            });

            setResponse(res.data);
            saveHistory({ method, url, body });
        } catch (err: any) {
            setError(
                err.response?.data || err.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen bg-[#0f1115] text-white p-6 grid grid-cols-4 gap-6">

            {/* LEFT – Inputs */}
            <div className="col-span-3 bg-[#161a22] rounded-xl p-6 shadow-lg">

                <h2 className="text-xl font-semibold mb-4">API Tester</h2>

                {/* Method + URL */}
                <div className="flex gap-3 mb-4">
                    <select
                        value={method}
                        onChange={e => setMethod(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
                    >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>PATCH</option>
                        <option>DELETE</option>
                    </select>

                    <input
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="/users/me"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2"
                    />
                </div>

                {/* Body */}
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-4 text-sm font-mono min-h-[160px]"
                    placeholder='{"key":"value"}'
                />

                {/* Send */}
                <button
                    onClick={sendRequest}
                    disabled={loading}
                    className="mt-4 inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                    {loading ? "Sending..." : "Send Request"}
                </button>

                {/* Response */}
                {(response || error) && (
                    <div className="mt-6 bg-[#0f1115] rounded-lg p-4 border border-gray-700">
                        <h3 className="text-sm text-gray-400 mb-2">
                            {error ? "Error" : "Response"}
                        </h3>
                        <pre className="text-green-400 text-sm overflow-auto">
                            {JSON.stringify(response || error, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* RIGHT – History */}
            <div className="bg-[#161a22] rounded-xl p-4 shadow-lg">
                <h3 className="text-sm font-semibold mb-3 text-gray-300">
                    Recent Requests
                </h3>

                <div className="space-y-2">
                    {history.length === 0 && (
                        <p className="text-xs text-gray-500">
                            No requests yet
                        </p>
                    )}

                    {history.map((h, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setMethod(h.method);
                                setUrl(h.url);
                                setBody(h.body);
                            }}
                            className="w-full text-left bg-[#0f1115] hover:bg-gray-800 border border-gray-700 rounded-lg p-3"
                        >
                            <p className="text-xs text-blue-400">
                                {h.method}
                            </p>
                            <p className="text-xs truncate">{h.url}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
