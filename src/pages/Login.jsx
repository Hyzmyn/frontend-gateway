import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services";
import { Button, Loading } from "../components/common";
import toast from "react-hot-toast";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identifier || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData);
      toast.success("Login successful!");

      // Navigate to success page after short delay
      setTimeout(() => {
        navigate("/success");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-panel login-panel--info">
          <p className="eyebrow">Frontend Gateway</p>
          <h1 className="login-title">Sign in to continue</h1>
          <p className="login-subtitle">
            Seamless access to your dashboards, exams, and management tools in
            one clean space.
          </p>
          <ul className="login-highlights">
            <li>Unified navigation for every role</li>
            <li>Tonal, distraction-free Material design</li>
            <li>Adaptive layouts across devices</li>
          </ul>
        </div>

        <div className="login-panel login-panel--form">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-header">
              <h2>Login</h2>
              <p>Enter your credentials to continue</p>
            </div>

            <div className="form-group">
              <label htmlFor="identifier">Email or Username</label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter your email or username"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="login-footer">
            <button
              className="link-button"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              ← Back to Welcome
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
