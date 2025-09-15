// src/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css'; // Make sure you have the CSS for edit buttons from the previous answer

const mockStudentData = {
    // ... (mock data object is exactly the same as before) ...
    name: 'OK', initials: 'OK', rollNumber: 'CS21B1234', department: 'Computer Science Engineering', batch: 2025, status: 'Looking for Opportunities', readinessScore: 78, contact: { email: 'ok@college.edu', phone: '+91 98765 43210', location: 'Mumbai, Maharashtra', dob: 'Dec 15, 2002' }, socials: { portfolio: '#', linkedin: '#', github: '#', other: '#' }, academics: { cgpa: 8.7, backlogs: 0, grade10: '94.2%', grade12: '91.8%', jeeMains: '156/300 (89.5 percentile)' }, skills: ['JavaScript', 'React.js', 'Node.js', 'Python', 'Java', 'MongoDB', 'MySQL', 'Git', 'Docker', 'AWS', 'Data Structures', 'Algorithms'], assessments: { technical: 85, aptitude: 78, communication: 82, coding: 90 }, certifications: [{ name: 'AWS Certified Developer Associate', issuer: 'Amazon Web Services', validUntil: 2026 }, { name: 'React Developer Certification', issuer: 'Meta', completed: 2024 }, { name: 'Google Cloud Digital Leader', issuer: 'Google Cloud', validUntil: 2025 }], preferences: { jobTypes: ['Full-time', 'Software Development', 'Frontend Development', 'Full Stack'], locations: ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Remote'], industries: ['Tech Startups', 'Fintech', 'E-commerce', 'SaaS'] },
};

const ProfilePage = () => {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStudentData(mockStudentData);
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleEditClick = () => {
        // Create a deep copy to avoid mutation issues with nested objects and arrays
        setEditableData(JSON.parse(JSON.stringify(studentData))); 
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        console.log("Saving this data to backend:", editableData);
        setStudentData(editableData);
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    // Handler for simple and nested text inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');
        setEditableData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };
    
    // NEW HANDLER for comma-separated lists (like Skills, Preferences)
    const handleCommaSeparatedChange = (e) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.'); // e.g., 'preferences.jobTypes'
        const updatedArray = value.split(',').map(item => item.trim()); // Split string by comma and trim whitespace
        setEditableData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: updatedArray }
        }));
    };

    // NEW HANDLER for arrays of objects (like Certifications)
    const handleCertificationChange = (e, index) => {
        const { name, value } = e.target; // name will be 'name' or 'issuer'
        const updatedCertifications = [...editableData.certifications];
        updatedCertifications[index][name] = value;
        setEditableData(prev => ({ ...prev, certifications: updatedCertifications }));
    };

    if (isLoading) {
        return <div style={{ color: 'white', textAlign: 'center', fontSize: '2rem', paddingTop: '100px' }}>Loading Profile...</div>;
    }

    // Determine which data to display: editableData in edit mode, otherwise studentData
    const displayData = isEditing ? editableData : studentData;

    return (
        <div className="container">
    
<aside className="sidebar">
    <div className="close-container">
        <button 
            className="close-btn" 
            onClick={() => navigate(-1)}
        >
            ×
        </button>
    </div>
    <div className="avatar">{displayData.initials}</div>
    
    {isEditing ? (
        <div style={{marginTop: '10px'}}>
            <label className="edit-input-label">Full Name</label>
            <input name="name" value={editableData.name} onChange={e => setEditableData({...editableData, name: e.target.value})} className="edit-input" />
        </div>
    ) : (
        <h1 className="student-name">{displayData.name}</h1>
    )}
    
    <div className="roll-number">Roll No: {displayData.rollNumber}</div>
    <div className="department">{displayData.department} • Batch {displayData.batch}</div>
    <div className="status-badge status-unplaced">{displayData.status}</div>

    {/* --- THIS SECTION IS NOW CORRECTED --- */}
    <div className="readiness-score">
        <div className="score-label">Placement Readiness Score</div>
        <div className="score-bar">
            <div className="score-fill" style={{ width: `${displayData.readinessScore}%` }}></div>
            <div className="score-text">{displayData.readinessScore}%</div>
        </div>
    </div>

    {isEditing ? (
        <div style={{textAlign: 'left', marginTop: '20px'}}>
             <label className="edit-input-label">Email</label>
             <input name="contact.email" value={editableData.contact.email} onChange={handleInputChange} className="edit-input" />
             <label className="edit-input-label" style={{marginTop: '10px'}}>Phone</label>
             <input name="contact.phone" value={editableData.contact.phone} onChange={handleInputChange} className="edit-input" />
             <label className="edit-input-label" style={{marginTop: '10px'}}>Location</label>
             <input name="contact.location" value={editableData.contact.location} onChange={handleInputChange} className="edit-input" />
        </div>
    ) : (
        <div className="contact-info">
            <div className="contact-item"><span className="contact-icon">📧</span><span>{displayData.contact.email}</span></div>
            <div className="contact-item"><span className="contact-icon">📱</span><span>{displayData.contact.phone}</span></div>
            <div className="contact-item"><span className="contact-icon">📍</span><span>{displayData.contact.location}</span></div>
            <div className="contact-item"><span className="contact-icon">🎂</span><span>{displayData.contact.dob}</span></div>
        </div>
    )}
    
    {isEditing ? (
        <div className="edit-controls">
            <button onClick={handleSaveClick} className="edit-btn save-btn">Save All Changes</button>
            <button onClick={handleCancelClick} className="edit-btn cancel-btn">Cancel</button>
        </div>
    ) : (
        <div className="edit-controls">
            <button onClick={handleEditClick} className="edit-btn save-btn">Edit Profile</button>
        </div>
    )}
    
    {/* --- THIS SECTION IS NOW CORRECTED (was missing before) --- */}
    {!isEditing && (
        <div className="social-links">
            <a href={displayData.socials.portfolio} className="social-link">📎</a>
            <a href={displayData.socials.linkedin} className="social-link">💼</a>
            <a href={displayData.socials.github} className="social-link">🐙</a>
            <a href={displayData.socials.other} className="social-link">🔗</a>
        </div>
    )}
</aside>

            <main className="main-content">
                {/* --- ACADEMICS CARD --- */}
                <section className="card">
                    <h2 className="section-title"><span className="section-icon">🎓</span>Academic Performance</h2>
                    {isEditing ? (
                        <div className="grid-2">
                            <div><label className="edit-input-label">Current CGPA</label><input name="academics.cgpa" value={editableData.academics.cgpa} onChange={handleInputChange} className="edit-input" type="number" step="0.1" /></div>
                            <div><label className="edit-input-label">Backlogs</label><input name="academics.backlogs" value={editableData.academics.backlogs} onChange={handleInputChange} className="edit-input" type="number" /></div>
                            <div><label className="edit-input-label">10th Grade %</label><input name="academics.grade10" value={editableData.academics.grade10} onChange={handleInputChange} className="edit-input" /></div>
                            <div><label className="edit-input-label">12th Grade %</label><input name="academics.grade12" value={editableData.academics.grade12} onChange={handleInputChange} className="edit-input" /></div>
                        </div>
                    ) : (
                        <div className="grid-2">
                            <div className="info-item"><div className="info-label">Current CGPA</div><div className="info-value cgpa-highlight">{displayData.academics.cgpa} / 10.0</div></div>
                            <div className="info-item"><div className="info-label">Backlogs</div><div className="info-value">{displayData.academics.backlogs}</div></div>
                            <div className="info-item"><div className="info-label">10th Grade</div><div className="info-value">{displayData.academics.grade10}</div></div>
                            <div className="info-item"><div className="info-label">12th Grade</div><div className="info-value">{displayData.academics.grade12}</div></div>
                        </div>
                    )}
                </section>

                {/* --- SKILLS CARD --- */}
                <section className="card">
                    <h2 className="section-title"><span className="section-icon">💡</span>Skills & Expertise</h2>
                    {isEditing ? (
                        <div>
                            <label className="edit-input-label">Skills (comma separated)</label>
                            <textarea name="skills.skills" value={editableData.skills.join(', ')} onChange={e => setEditableData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }))} className="edit-input" rows="3"></textarea>
                        </div>
                    ) : (
                        <div className="skills-container">{displayData.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}</div>
                    )}
                </section>

                {/* --- CERTIFICATIONS CARD --- */}
                <section className="card">
                    <h2 className="section-title"><span className="section-icon">🏆</span>Certifications</h2>
                    {isEditing ? (
                        editableData.certifications.map((cert, index) => (
                            <div key={index} style={{ marginBottom: '15px' }}>
                                <label className="edit-input-label">Certification #{index + 1} Name</label>
                                <input name="name" value={cert.name} onChange={(e) => handleCertificationChange(e, index)} className="edit-input" />
                                <label className="edit-input-label" style={{marginTop: '5px'}}>Issuer</label>
                                <input name="issuer" value={cert.issuer} onChange={(e) => handleCertificationChange(e, index)} className="edit-input" />
                            </div>
                        ))
                    ) : (
                        displayData.certifications.map(cert => (
                            <div key={cert.name} className="certification-item">
                                <div className="cert-name">{cert.name}</div>
                                <div className="cert-issuer">{cert.issuer} • {cert.validUntil ? `Valid until ${cert.validUntil}` : `Completed ${cert.completed}`}</div>
                            </div>
                        ))
                    )}
                </section>
                
                {/* --- CAREER PREFERENCES CARD --- */}
                <section className="card">
                    <h2 className="section-title"><span className="section-icon">🎯</span>Career Preferences</h2>
                     {isEditing ? (
                        <div>
                            <label className="edit-input-label">Job Types (comma separated)</label>
                            <textarea name="preferences.jobTypes" value={editableData.preferences.jobTypes.join(', ')} onChange={handleCommaSeparatedChange} className="edit-input" rows="2"></textarea>
                            <label className="edit-input-label" style={{marginTop: '10px'}}>Locations (comma separated)</label>
                            <textarea name="preferences.locations" value={editableData.preferences.locations.join(', ')} onChange={handleCommaSeparatedChange} className="edit-input" rows="2"></textarea>
                             <label className="edit-input-label" style={{marginTop: '10px'}}>Industries (comma separated)</label>
                            <textarea name="preferences.industries" value={editableData.preferences.industries.join(', ')} onChange={handleCommaSeparatedChange} className="edit-input" rows="2"></textarea>
                        </div>
                    ) : (
                        <div>
                            <div className="info-item"><div className="info-label">Preferred Job Types</div><div className="preferences-list">{displayData.preferences.jobTypes.map(item => <span key={item} className="preference-item">{item}</span>)}</div></div>
                            <div className="info-item"><div className="info-label">Preferred Locations</div><div className="preferences-list">{displayData.preferences.locations.map(item => <span key={item} className="preference-item">{item}</span>)}</div></div>
                            <div className="info-item"><div className="info-label">Industries of Interest</div><div className="preferences-list">{displayData.preferences.industries.map(item => <span key={item} className="preference-item">{item}</span>)}</div></div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ProfilePage;