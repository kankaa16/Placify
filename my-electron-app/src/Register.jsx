import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { User, Mail, Lock, Building, GraduationCap } from 'lucide-react';
import './register-hero.css';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    university: '',
    branch: '',
    emailID: '',
    password: '',
    role: 'student',
    socials: { other: [] }
  });
  const [errors, setErrors] = useState({});

  const branches = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics and Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Biotechnology Engineering",
    "Automobile Engineering",
    "Metallurgical Engineering",
    "Production Engineering",
    "Petroleum Engineering",
    "Instrumentation Engineering",
    "Industrial Engineering",
    "Environmental Engineering"
  ];

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fName) newErrors.fName = "First name is required";
    if (!formData.lName) newErrors.lName = "Last name is required";
    if (!formData.university) newErrors.university = "University is required";
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.emailID) newErrors.emailID = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.emailID)) newErrors.email = "Enter valid email";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = { ...formData };

// Ensure socials.other is always an array
if (!payload.socials?.other || !Array.isArray(payload.socials.other)) {
  payload.socials.other = [];
}


  try {
    await register(payload);
    navigate('/dashboard');
  } catch (err) {
    console.error("Registration failed:", err);
  }
};

  return (
    <div className="hero-page">
      <div className="hero-shell">
        <header className="brand">
          <div className="brand-badge" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#19c2b6" />
              <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="brand-name">Placify</div>
        </header>

        <div className="hero-content">
          <div className="hero-head">
            <h1>Join. Learn. Achieve.</h1>
            <h3>Get placement-ready with Placify</h3>
          </div>

          <div className="center-lines">
            <div className="line left-line" />
            <div className="login-card-outer">
              <div className="login-card">
                <div className="card-title">
                  <div className="title-main">Create Account</div>
                  <div className="title-sub">Sign up to start your journey</div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="register-form">
                  <div className="row">
                    <div className="field icon-input">
                      <User size={18} />
                      <input
                        name="fName"
                        placeholder="First Name"
                        value={formData.fName}
                        onChange={handleChange}
                        className={errors.fName ? 'is-error' : ''}
                      />
                    </div>
                    <div className="field icon-input">
                      <User size={18} />
                      <input
                        name="lName"
                        placeholder="Last Name"
                        value={formData.lName}
                        onChange={handleChange}
                        className={errors.lName ? 'is-error' : ''}
                      />
                    </div>
                  </div>
                  {errors.fName && <span className="field-error">{errors.fName}</span>}
                  {errors.lName && <span className="field-error">{errors.lName}</span>}

                  <div className="field icon-input">
                    <Building size={18} />
                    <input
                      name="university"
                      placeholder="University / College"
                      value={formData.university}
                      onChange={handleChange}
                      className={errors.university ? 'is-error' : ''}
                    />
                  </div>
                  {errors.university && <span className="field-error">{errors.university}</span>}

                  <div className="field icon-input">
                    <GraduationCap size={18} />
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className={errors.branch ? 'is-error' : ''}
                    >
                      <option value="">Select your branch</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  {errors.branch && <span className="field-error">{errors.branch}</span>}

                  <div className="field icon-input">
                    <Mail size={18} />
                    <input
                      name="emailID"
                      type="email"
                      placeholder="Email"
                      value={formData.emailID}
                      onChange={handleChange}
                      className={errors.emailID ? 'is-error' : ''}
                    />
                  </div>
                  {errors.emailID && <span className="field-error">{errors.emailID}</span>}

                  <div className="field icon-input">
                    <Lock size={18} />
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'is-error' : ''}
                    />
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}

                  <button type="submit" className="btn-register" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                  </button>
                </form>

                <div className="register-footer">
                  <span>Already have an account? </span>
                  <Link to="/login">Login</Link>
                </div>
              </div>
            </div>
            <div className="line right-line" />
          </div>

          <footer className="hero-foot">© {new Date().getFullYear()} Placify. All rights reserved.</footer>
        </div>
      </div>
    </div>
  );
};

export default Register;
