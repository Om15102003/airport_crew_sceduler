import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Plane, RotateCw, AlertCircle, ArrowLeft, Users } from 'lucide-react';

const Schedules = () => {
  const { adminId } = useParams(); // Retrieve adminId from route parameters
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(null);
  useEffect(()=>{
          fetch(`http://localhost:4000/flight-tasks?adminId=${adminId}`,{
              method:'GET',
              headers:{
                  'Content-Type':'application/json',
              },
          }).then((response)=>response.json()).then((data)=>setFlights(data));
          //console.log(adminDetails);
          setLoading(false);
      },[adminId])
  

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleAssignTasks = (flightNumber) => {
    setAssigning(flightNumber);
    // Simulate API call
    setTimeout(() => {
      setAssigning(null);
    }, 2000);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <AlertCircle className="w-6 h-6 inline-block mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={handleBackClick}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 text-[40px] font-[500]" style={{ color: '#1976d2' }}>
          Pending Task Assignments
        </h1>
        <p className="text-gray-600 mt-2">Manage and assign tasks for upcoming flights</p>
      </div>

      <div className="grid gap-6">
        {flights.map((flight) => (
          <div key={flight.flight_number} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Plane className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Flight {flight.flight_number}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Flight Time</div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Departure:</span>
                        <span className="ml-2">{formatDateTime(flight.departure_time)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Arrival:</span>
                        <span className="ml-2">{formatDateTime(flight.arrival_time)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Route</div>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-600">From:</span>
                        <span className="ml-2">{flight.origin}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">To:</span>
                        <span className="ml-2">{flight.destination}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Pending Tasks</h3>
                  <div className="space-y-3">
                    {flight.pending_tasks.map((task, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800">{task.task_name}</span>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            <span>Crew: {task.crew_required}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAssignTasks(flight.flight_number)}
                disabled={assigning === flight.flight_number}
                className={`px-4 py-2 rounded-md text-white font-medium transition-colors
                  ${assigning === flight.flight_number
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {assigning === flight.flight_number ? (
                  <div className="flex items-center space-x-2">
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Assigning...</span>
                  </div>
                ) : (
                  'Assign Tasks'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedules;
