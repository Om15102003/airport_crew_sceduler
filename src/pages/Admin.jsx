import React,{useContext, useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import Stats from '../components/Stats/Stats';
import RecentActivities from '../components/RecentActivities/RecentActivities';
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
    const confirmLogout= window.confirm("Are you sure you want to logout?");
    if(confirmLogout){
      console.log('Logging out...');
      window.location.replace('/');
    }
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
          <a href={`/schedule/${adminId}`} className="nav-link">Schedule Management</a>
          <a href={`/crew/${adminId}`} className="nav-link">Crew Members</a>
          <a href={`/new_flight/${encodeURIComponent(adminDetails.airline)}`} className="nav-link">New Flight</a>
        </div>

        <div className="nav-profile">
          <div className="profile-info">
            <span className="user-name">{adminDetails.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>
      <main className="main-content">

      <Stats airline={adminDetails.airline}/>

        <RecentActivities airline={adminDetails.airline}/>
      </main>
    </div>
  );
};

export default AdminDashboard;