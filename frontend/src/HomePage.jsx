import React, { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const endpoint =
      "https://dc4k2rn2l5.execute-api.us-east-1.amazonaws.com/Post/lambda_function";
  
    // Send correct key expected by Lambda: user_name
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
        alert(parsed.message || "Success");
  
        if (isLogin) {
          // Save session info (optional)
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", parsed.user_name || "");
  
          // ✅ Redirect to dashboard
          window.location.href = "/dashboard";
        }
      } else {
        alert(parsed.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error calling Lambda:", error);
      alert("An error occurred. Please try again.");
    }
  };
  
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Login" : "Register"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-black"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-black"
            required
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 underline"
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
}
