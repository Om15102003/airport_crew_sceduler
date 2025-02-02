import React  from 'react';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
//import { ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import Employee from './pages/Employee';
import Tasks from './pages/Tasks';
import NewFlight from './pages/NewFlight';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Crew from './pages/Crew';
import Assign from './pages/Assign';
import Work from './pages/Work';
import AboutCrew from './pages/About_Crew';
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

            <Route path="/schedule" element={<Schedules />} >
            <Route path=':adminId' element={<Schedules/>}/>
            </Route>
            <Route path="/employees" element={<Employee />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/new_flight" element={<NewFlight />} >
            <Route path=':airline' element={<NewFlight/>}/>
            </Route>
            <Route path="/admin" element={<Admin/>}>
              <Route path=':adminId' element={<Admin/>}/>
            </Route>
            <Route path="/assign/:flightNumber/:adminId" element={<Assign />} />
            
            <Route path="/crew" element={<Crew />}>
            <Route path=':adminId' element={<Crew/>}/>
            </Route>
            <Route path="/aboutcrew" element={<AboutCrew />}>
            <Route path=':crewId' element={<AboutCrew/>}/>
            </Route>
            <Route path="/work" element={<Work />}>
            <Route path=':crewId' element={<Work/>}/>
            </Route>
          </Routes>
      </BrowserRouter>

    </div>
  );
}
export default App;
