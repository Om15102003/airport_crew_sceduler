import React,{useContext, useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import './CSS/AdminDashboard.css';

const AdminDashboard = () => {
    const {adminId}=useParams();
    const [adminDetails, setAdminDetails] = useState({});
    useEffect(()=>{
        fetch(`http://localhost:4000/admin?adminId=${adminId}`,{
            method:'GET',
            headers:{
                'Content-Type':'application/json',
            },
        }).then((response)=>response.json()).then((data)=>data.user).then((data)=>setAdminDetails(data));
        //console.log(adminDetails);
    },[adminId])
  const handleLogout = () => {
    console.log('Logging out...');
    // Add logout logic here
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h2>{adminDetails.airline}</h2>
        </div>
        
        <div className="nav-links">
          <a href={`/dashboard/${encodeURIComponent(adminDetails.airline)}`} className="nav-link">Dashboard</a>
          <a href="/schedule" className="nav-link">Schedule Management</a>
          <a href={`/crew/${adminId}`} className="nav-link">Crew Members</a>
          <a href="/reports" className="nav-link">Reports</a>
          <a href="/settings" className="nav-link">Settings</a>
        </div>

        <div className="nav-profile">
          <div className="profile-info">
            <span className="user-name">{adminDetails.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="welcome-section">
          <h1>Welcome to Admin Dashboard</h1>
          <p>Manage your airport ground crew operations efficiently</p>
        </div>

        {/* Quick Actions Cards */}
        <div className="quick-actions">
          <div className="action-card">
            <h3>Crew Management</h3>
            <p>Total Active Crew Members: 45</p>
            <button className="action-btn">View Details</button>
          </div>

          <div className="action-card">
            <h3>Today's Schedule</h3>
            <p>Upcoming Shifts: 12</p>
            <button className="action-btn">Manage Schedule</button>
          </div>

          <div className="action-card">
            <h3>Pending Requests</h3>
            <p>Leave Requests: 3</p>
            <button className="action-btn">Review Requests</button>
          </div>

          <div className="action-card">
            <h3>Performance Reports</h3>
            <p>Last Updated: Today</p>
            <button className="action-btn">Generate Report</button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">09:45 AM</span>
              <p>New crew schedule published for tomorrow</p>
            </div>
            <div className="activity-item">
              <span className="activity-time">09:30 AM</span>
              <p>Leave request approved for John Doe</p>
            </div>
            <div className="activity-item">
              <span className="activity-time">09:15 AM</span>
              <p>New crew member added to Team B</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;