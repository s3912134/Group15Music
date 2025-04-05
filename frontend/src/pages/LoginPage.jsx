import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import musicLogo from '../assets/Music_logo.svg';

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.status === 200) {
            navigate("/home");
        } else {
            setError(data.error || "Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="bg-white p-8 rounded-2xl shadow-md w-96">
                <img src={musicLogo} alt="Music Logo" className="w-24 h-24 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full mb-4 p-2 border border-gray-300 rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full mb-4 p-2 border border-gray-300 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded mt-4"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
