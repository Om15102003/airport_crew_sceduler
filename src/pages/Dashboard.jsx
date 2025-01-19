import React, { useState, useEffect } from 'react';
import './CSS/Dashboard.css';
import { useParams } from 'react-router-dom';

const FlightDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [flights, setFlights] = useState([]); // State to hold flight data
  const handleGoBack = () => {
    window.history.back();
  };
    
    const {airline}=useParams();
    console.log(airline);

  // Sample data - replace with your actual data
  // const flights = [
  //   {
  //     airline: "Emirates Airways",
  //     flight_number: "EK-507",
  //     departure_time: "10:30 AM",
  //     arrival_time: "1:45 PM",
  //     destination: "Dubai",
  //     origin: "London",
  //     schedule_date: "2025-01-20",
  //     schedule_status: "Confirmed"
  //   },
  //   {
  //     airline: "Emirates Airways",
  //     flight_number: "EK-508",
  //     departure_time: "2:30 PM",
  //     arrival_time: "5:45 PM",
  //     destination: "New York",
  //     origin: "Dubai",
  //     schedule_date: "2025-01-20",
  //     schedule_status: "Pending"
  //   }
  // ];
  useEffect(() => {
    // Fetch flight details for the specific airline
    fetch(`http://localhost:4000/flights?airline=${airline}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch flight details');
            }
            return response.json();
        })
        .then((data) => {
            setFlights(data); // Update state with fetched flights
            
        })
        .catch((err) => {
            console.error('Error fetching flights:', err);          
        });
},[airline]);
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  const filteredFlights = flights.filter(flight => {
    const matchesFlightNumber = flight.flight_number
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      flight.schedule_status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesFlightNumber && matchesFilter;
  });
  console.log(flights);
  const extractTime = (isoString) => {
    const date = new Date(isoString); // Parse the ISO string
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format time
  };
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
      <div className="airline-header">
        <button onClick={handleGoBack} className="back-button">
          ← Back
        </button>
        {flights.length > 0 && <h1>{flights[0].airline}</h1>}
      </div>
      <p>Flight Schedule Dashboard</p>
      
      <div className="date-display">
        <span>Today: {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
      </div>
    </header>
      

      <div className="dashboard-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by flight number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flight-stats">
          <div className="stat-item">
            <span className="stat-label">Total Flights</span>
            <span className="stat-value">{flights.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Confirmed</span>
            <span className="stat-value">{flights.filter(f => f.schedule_status.toLowerCase() === 'confirmed').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{flights.filter(f => f.schedule_status.toLowerCase() === 'pending').length}</span>
          </div>
        </div>
      </div>

      <div className="flights-table-container">
        <table className="flights-table">
          <thead>
            <tr>
              <th>Flight No.</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlights.map((flight, index) => (
              <tr key={index}>
                <td>
                  <strong>{flight.flight_number}</strong>
                </td>
                <td>{flight.origin}</td>
                <td>{flight.destination}</td>
                <td>{extractTime(flight.departure_time)}</td>
                <td>{extractTime(flight.arrival_time)}</td>
                <td>{new Date(flight.schedule_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(flight.schedule_status)}`}>
                    {flight.schedule_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightDashboard;