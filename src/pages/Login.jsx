import React, { useState } from 'react';
import "./CSS/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'crew'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const loginUrl=async ()=>{
    let responseData;
    await fetch('http://localhost:4000/login',{
        method:'POST',
        headers:{
            Accept:'application/json',
            'Content-Type':'application/json',
        },
        body:JSON.stringify(formData),
    }).then((response)=>response.json()).then((data)=>responseData=data);
    
    
    if(responseData.success){
        localStorage.setItem('auth-token',responseData.token);
        if(formData.role==='admin'){
          window.location.replace(`/${formData.role}/${responseData.user.id}`);
        }
        else{
          window.location.replace(`/about${formData.role}/${responseData.user.id}`);
        }
    }
    else{
        
        alert("Invalid credentials");
    }
  }
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Ground Crew Scheduler</h1>
          <p>AI-Powered Airport Operations Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <p className="role-label">Select Role</p>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="crew"
                  name="role"
                  value="crew"
                  checked={formData.role === 'crew'}
                  onChange={handleChange}
                />
                <label htmlFor="crew">Crew Member</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="admin"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                />
                <label htmlFor="admin">Admin</label>
              </div>
            </div>
          </div>

          <button type="submit" className="login-button" onClick={()=>{loginUrl()}}>
            Sign In
          </button>

          <p className="forgot-password">
            Forgot your password? Contact your administrator
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;