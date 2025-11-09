import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  FileText, 
  LogOut,
  Settings,
  PlusCircle,
  Search
} from 'lucide-react';
import './adashboard.css';

const PlacementOfficerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } 
    catch (error) { console.error('Logout error:', error); }
  };

  const dashboardCards = [
    { id: 'students', title: 'Student Management', description: 'View and manage student profiles and readiness', icon: Users, colorClass: 'card-blue', coming: false },
    { id: 'managecompanies', title: 'Company Data', description: 'Manage company placement statistics', icon: Building2, colorClass: 'card-green', coming: false },
    { id: 'analytics', title: 'Placement Analytics', description: 'View comprehensive placement insights', icon: TrendingUp, colorClass: 'card-purple', coming: false },
    { id: 'reports', title: 'Generate Reports', description: 'Create placement reports and statistics', icon: FileText, colorClass: 'card-yellow', coming: true },
    { id: 'offers', title: 'Approved Offers', description: 'View all verified offers and placement records', icon: FileText, colorClass: 'card-green', coming: false },
    {id:'verify', title:'Verify Offer Letters', description: 'Verify and approve offer letters for maintaining placement stats up-to-date', icon:FileText, colorClass:'card-blue', coming:false},

  ];

  const quickStats = [
    { label: 'Total Students', value: '245', colorClass: 'value-blue' },
    { label: 'Placed Students', value: '156', colorClass: 'value-green' },
    { label: 'Active Companies', value: '42', colorClass: 'value-purple' },
    { label: 'Avg Package', value: '₹8.5L', colorClass: 'value-yellow' }
  ];

  const handleCardClick = (id) => {
    if (id === 'managecompanies') navigate('/manage-companies');
    if (id === 'students') navigate('/student-management');
    if (id === 'analytics') navigate('/analytics');
    if (id === 'offers') navigate('/approved-offers');
    if (id === 'verify') navigate('/verify-offers');
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="logo">P</motion.div>
            <div>
              <h1>Placify</h1>
              <p>Placement Officer Dashboard</p>
            </div>
          </div>

          <div className="header-actions">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="circle-btn"
              onClick={() => navigate('/')}
              title="Settings"
            >
              <Settings style={{ width: 20, height: 20 }} />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="circle-btn logout-btn"
              onClick={async () => {
                try {
                  await handleLogout();
                  navigate('/login');
                } catch (err) {
                  console.error(err);
                }
              }}
              title="Logout"
            >
              <LogOut style={{ width: 20, height: 20 }} />
            </motion.div>
          </div>
        </div>
      </header>

      <main className="main">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="welcome">
          <h2>Welcome Admin! 📊</h2> 
          <p>Manage student placements and track institutional performance</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stats-grid">
          {quickStats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + index * 0.1 }} className="stat">
              <p className="label">{stat.label}</p>
              <p className={`value ${stat.colorClass}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="quick-actions">
          <div className="cards-grid">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="card card-blue"
              onClick={() => navigate("/add-company")}
            >
              <PlusCircle className="icon-box" />
              <span>Add Company</span>
            </motion.button>

            {/* <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="card card-green">
              <Search className="icon-box" />
              <span>Search Students</span>
            </motion.button> */}

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="card card-yellow">
              <FileText className="icon-box" />
              <span>Generate Report</span>
            </motion.button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="cards-grid">
          {dashboardCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.id}
                className={`card ${card.colorClass}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(card.id)}
                style={{ cursor: 'pointer' }}
              >
                {card.coming && <div className="badge">Coming Soon</div>}
                <div className="icon-box"><IconComponent /></div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
};

export default PlacementOfficerDashboard;
