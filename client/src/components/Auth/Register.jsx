import { useState } from "react";

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onRegister(data.user);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background shapes */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          top: "-250px",
          left: "-250px",
          animation: "float 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          bottom: "-150px",
          right: "-150px",
          animation: "float 15s ease-in-out infinite reverse",
        }}
      />
      <div
        style={{
          background: "white",
          padding: "48px",
          borderRadius: "var(--border-radius-xl)",
          boxShadow: "var(--shadow-2xl)",
          width: "100%",
          maxWidth: "440px",
          position: "relative",
          zIndex: 1,
          animation: "slideInUp 0.5s ease",
        }}
      >
        {/* Logo/Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "var(--spacing-3xl)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "var(--border-radius-xl)",
              background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)",
              marginBottom: "var(--spacing-lg)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <span style={{ fontSize: "32px", color: "white", fontWeight: "700" }}>
              C
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              marginBottom: "var(--spacing-sm)",
              color: "var(--gray-900)",
              fontSize: "28px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
            }}
          >
            Create Account
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--gray-600)",
              fontSize: "15px",
            }}
          >
            Join CollabCanvas today
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "var(--error-color)",
              color: "white",
              padding: "var(--spacing-md)",
              borderRadius: "var(--border-radius)",
              marginBottom: "var(--spacing-xl)",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "var(--shadow-sm)",
              animation: "shake 0.5s ease",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <label
              style={{
                display: "block",
                marginBottom: "var(--spacing-sm)",
                color: "var(--gray-700)",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "var(--spacing-md)",
                border: "2px solid var(--gray-200)",
                borderRadius: "var(--border-radius)",
                fontSize: "15px",
                outline: "none",
                transition: "all var(--transition-fast)",
                background: "var(--gray-50)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary-color)";
                e.target.style.background = "white";
                e.target.style.boxShadow = "0 0 0 3px var(--primary-light)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--gray-200)";
                e.target.style.background = "var(--gray-50)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <label
              style={{
                display: "block",
                marginBottom: "var(--spacing-sm)",
                color: "var(--gray-700)",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "var(--spacing-md)",
                border: "2px solid var(--gray-200)",
                borderRadius: "var(--border-radius)",
                fontSize: "15px",
                outline: "none",
                transition: "all var(--transition-fast)",
                background: "var(--gray-50)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary-color)";
                e.target.style.background = "white";
                e.target.style.boxShadow = "0 0 0 3px var(--primary-light)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--gray-200)";
                e.target.style.background = "var(--gray-50)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <label
              style={{
                display: "block",
                marginBottom: "var(--spacing-sm)",
                color: "var(--gray-700)",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "var(--spacing-md)",
                border: "2px solid var(--gray-200)",
                borderRadius: "var(--border-radius)",
                fontSize: "15px",
                outline: "none",
                transition: "all var(--transition-fast)",
                background: "var(--gray-50)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary-color)";
                e.target.style.background = "white";
                e.target.style.boxShadow = "0 0 0 3px var(--primary-light)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--gray-200)";
                e.target.style.background = "var(--gray-50)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-2xl)" }}>
            <label
              style={{
                display: "block",
                marginBottom: "var(--spacing-sm)",
                color: "var(--gray-700)",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "var(--spacing-md)",
                border: "2px solid var(--gray-200)",
                borderRadius: "var(--border-radius)",
                fontSize: "15px",
                outline: "none",
                transition: "all var(--transition-fast)",
                background: "var(--gray-50)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary-color)";
                e.target.style.background = "white";
                e.target.style.boxShadow = "0 0 0 3px var(--primary-light)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--gray-200)";
                e.target.style.background = "var(--gray-50)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "var(--spacing-md)",
              background: loading
                ? "var(--gray-300)"
                : "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)",
              color: "white",
              border: "none",
              borderRadius: "var(--border-radius)",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all var(--transition-fast)",
              boxShadow: loading ? "none" : "var(--shadow-md)",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "var(--shadow-lg)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "var(--shadow-md)";
              }
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "var(--spacing-2xl)",
            paddingTop: "var(--spacing-2xl)",
            borderTop: "1px solid var(--gray-200)",
            fontSize: "14px",
            color: "var(--gray-600)",
          }}
        >
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            style={{
              color: "var(--primary-color)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all var(--transition-fast)",
            }}
            onMouseOver={(e) => {
              e.target.style.color = "var(--primary-hover)";
              e.target.style.textDecoration = "underline";
            }}
            onMouseOut={(e) => {
              e.target.style.color = "var(--primary-color)";
              e.target.style.textDecoration = "none";
            }}
          >
            Sign in
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(20px);
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
