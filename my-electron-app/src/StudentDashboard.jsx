import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './sdashboard.css';
import { useAuth } from '../contexts/AuthContext';
import PlacementAnalytics from "./PlacementAnalytics";
import {
  BookOpen,
  Code,
  Award,
  BarChart3,
  MessageSquare,
  LogOut,
  User,
  Settings
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const dashboardCards = [
    {
      id: 'resume',
      title: 'Resume Analysis',
      description: 'Upload and analyze your resume quality',
      icon: BookOpen,
      colorClass: 'card-blue',
      iconClass: 'icon-blue',
      coming: false,
      route: '/resume-analyzer'
    },
    {
      id: 'coding',
      title: 'Coding Scores',
      description: 'Track your coding platform scores',
      icon: Code,
      colorClass: 'card-green',
      iconClass: 'icon-green',
      coming: false,
      route: '/coding-scores'
    },
    {
      id: 'certifications',
      title: 'Certifications',
      description: 'Manage your professional certifications',
      icon: Award,
      colorClass: 'card-yellow',
      iconClass: 'icon-yellow',
      coming: false,
      route: '/certifications'
    },
    {
      id: 'analytics',
      title: 'Placement Analytics',
      description: 'View placement trends and statistics',
      icon: BarChart3,
      colorClass: 'card-purple',
      iconClass: 'icon-purple',
      coming: false,
      route: '/placement-analytics'
    },
    {
      id: 'interview',
      title: 'AI Mock Interview',
      description: 'Practice interviews with AI assistance',
      icon: MessageSquare,
      colorClass: 'card-red',
      iconClass: 'icon-red',
      coming: false,
      route: '/ai-interview' 
    }
  ];

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="logo"
            >
              P
            </motion.div>
            <div>
              <h1>Placify</h1>
              <p>Student Dashboard</p>
            </div>
          </div>

          <div className="header-actions">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="circle-btn"
              onClick={() => navigate('/profile')}
              title="Profile"
            >
              <User style={{ width: 20, height: 20 }} />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="circle-btn"
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <Settings style={{ width: 20, height: 20 }} />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="circle-btn logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut style={{ width: 20, height: 20 }} />
            </motion.div>
          </div>
        </div>
      </header>

      <main className="main">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="welcome"
        >
          <h2>
            Welcome back, {user?.fName ? user.fName : user?.emailID?.split('@')[0]}! 👋
          </h2>
          <p className="text-muted">
            Track your placement readiness and enhance your job prospects
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="stats-grid"
        >
          {[
            { label: 'Readiness Score', value: '85%', cls: 'green' },
            { label: 'Resume Score', value: '92/100', cls: 'blue' },
            { label: 'Certifications', value: '3', cls: 'yellow' },
            { label: 'Mock Interviews', value: '12', cls: 'purple' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.06 }}
              className="stat"
              style={{ cursor: 'pointer' }}
            >
              <div className="label">{stat.label}</div>
              <div className={`value ${stat.cls}`}>{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="cards-grid"
        >
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 + index * 0.06 }}
                whileHover={{ y: -6 }}
                className={`card ${card.colorClass}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!card.coming && card.route) {
                    navigate(card.route);
                  }
                }}
                style={{ cursor: card.coming ? 'not-allowed' : 'pointer' }}
              >
                <div className="accent" />
                {card.coming && <div className="badge">Coming Soon</div>}

                <div>
                  <div className={`icon-box ${card.iconClass}`}>
                    <Icon style={{ width: 22, height: 22 }} />
                  </div>

                  <h3>{card.title}</h3>
                  <p>{card.description}</p>

                  <div className="cta">
                    <span className="small">
                      {card.coming ? 'Coming Soon' : 'Get Started'}
                    </span>
                    {!card.coming && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72 }}
          className="recent"
        >
          <h3>Recent Activity</h3>
          <div>
            {[
              'Resume uploaded and analyzed - Score: 92/100',
              'Updated LeetCode score to 1850',
              'Completed AWS Cloud Practitioner certification',
              'Participated in mock interview session'
            ].map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.76 + i * 0.04 }}
                className="item"
              >
                <div className="dot" />
                <div className="small">{act}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDashboard;
