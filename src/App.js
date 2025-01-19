import React  from 'react';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
//import { ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import Employee from './pages/Employee';
import Tasks from './pages/Tasks';
import Report from './pages/Report';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Crew from './pages/Crew';
import './index.css'
import './App.css';
function App() {
  return (
    <div>
      <BrowserRouter> 
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />}>
            <Route path=':airline' element={<Dashboard/>}/>
            </Route>
            {/* <Route path="/dashboard/:airline" element={<Dashboard />} /> */}

            <Route path="/schedule" element={<Schedules />} />
            <Route path="/employees" element={<Employee />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/admin" element={<Admin/>}>
              <Route path=':adminId' element={<Admin/>}/>
            </Route>
            <Route path="/crew" element={<Crew />}>
            <Route path=':adminId' element={<Crew/>}/>
            </Route>
          </Routes>
      </BrowserRouter>

    </div>
  );
}
export default App;
