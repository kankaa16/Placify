import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import './login-hero.css';

const Login = () => {
  const { login, loading, user } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  if (user?.role === 'student') return <Navigate to="/student-dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await login(formData);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  if (loading) return <LoadingSpinner message="Signing in..." />;

  return (
    <div className="hero-page">
      <div className="hero-shell">
        <header className="brand">
          <div className="brand-badge" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#19c2b6" />
              <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="brand-name">Placify</div>
        </header>

        <div className="hero-content">
          <div className="hero-head">
  <h1>Prepare. Practice. Succeed.</h1>
  <h3>Your pathway to dream placements</h3>
</div>

          <div className="center-lines">
            <div className="line left-line" />
            <div className="login-card-outer">
              <div className="login-card">
                <div className="card-title">
                  <div className="title-main">Welcome Back</div>
                  <div className="title-sub">Login to your account to continue</div>
                </div>

                <form className="form" onSubmit={handleSubmit} noValidate>
                  <label className="field">
                    <div className="field-label">Email</div>
                    <div className="input-wrap">
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input ${errors.email ? 'is-error' : ''}`}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <div className="field-error">{errors.email}</div>}
                  </label>

                  <label className="field">
                    <div className="field-label">Password</div>
                    <div className="input-wrap">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`input ${errors.password ? 'is-error' : ''}`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="show-password-btn"
                        onClick={() => setShowPassword(prev => !prev)}
                        aria-label={showPassword ? 'hide password' : 'show password'}
                      >
                        {showPassword ? <EyeOff className="eye" /> : <Eye className="eye" />}
                      </button>
                    </div>
                    {errors.password && <div className="field-error">{errors.password}</div>}
                  </label>

                  <button type="submit" className="btn-login" disabled={loading}>
                    {loading ? 'Signing in...' : <><LogIn className="btn-icon" /> Login</>}
                  </button>
                </form>
                <div className="register-link">
    <span>Don't have an account? </span>
    <Link to="/register" className="link-register">Sign Up</Link>
  </div>
              </div>
            </div>
            <div className="line right-line" />
          </div>

          <footer className="hero-foot">© {new Date().getFullYear()} abcd Ltd. All rights reserved.</footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
