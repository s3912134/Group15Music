import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "./assets/loading_animation.json";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false); // 🔹 loading state

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      window.location.href = "/dashboard";
    }
  }, []);  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 🔹 Start loading

    const endpoint =
      "https://dc4k2rn2l5.execute-api.us-east-1.amazonaws.com/Post/lambda_function";

    const payload = isLogin
      ? { action: "login", email, password }
      : { action: "register", email, password, user_name: username };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const parsed = typeof data.body === "string" ? JSON.parse(data.body) : data;

      if (parsed.status === "success") {
        if (isLogin) {
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", parsed.user_name || "");
          window.location.href = "/dashboard";
        }
      } else {
        alert(parsed.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error calling Lambda:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // 🔹 Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-black">
          {isLogin ? "Login to Your Account" : "Create Your Account"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500"
              required
              disabled={loading}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-500"
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <Lottie
                animationData={loadingAnimation}
                style={{ height: 30, width: 30 }}
              />
            ) : (
              isLogin ? "Login" : "Register"
            )}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-medium underline cursor-pointer"
          >
            {isLogin ? "Register here" : "Login here"}
          </span>
        </p>
      </div>
    </div>
  );
}
