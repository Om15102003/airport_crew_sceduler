import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Clock, 
  Plane, 
  RotateCw, 
  AlertCircle, 
  ArrowLeft, 
  Users, 
  Plus 
} from 'lucide-react';

const Schedules = () => {
  const { adminId } = useParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [newTask, setNewTask] = useState({
    flight_number: '',
    task_name: '',
    description: '',
    crew_required: ''
  });
  const [showTaskInput, setShowTaskInput] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/flight-tasks?adminId=${adminId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setFlights(data);
        setLoading(false);
      });
  }, [adminId]);

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
    window.location.replace(`/assign/${flightNumber}/${adminId}`)
    setAssigning(flightNumber);
    setTimeout(() => {
      setAssigning(null);
    }, 2000);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value,
      flight_number: showTaskInput
    }));
  };

  const handleAddTask = async () => {
    if (!newTask.task_name || !newTask.description || !newTask.crew_required) {
      alert('Please fill in all task details');
      return;
    }
    console.log((newTask));
    
    try {
      const response = await fetch('http://localhost:4000/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const updatedFlights = flights.map(flight => 
        flight.flight_number === showTaskInput 
          ? { 
              ...flight, 
              pending_tasks: [...flight.pending_tasks, newTask] 
            } 
          : flight
      );

      setFlights(updatedFlights);
      
      setNewTask({
        flight_number: '',
        task_name: '',
        description: '',
        crew_required: ''
      });
      setShowTaskInput(null);
    } catch (error) {
      alert('Error adding task: ' + error.message);
    }
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
        <h1 
          className="text-3xl font-bold text-gray-800 text-[40px] font-[500]" 
          style={{ color: '#1976d2' }}
        >
          Pending Task Assignments
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and assign tasks for upcoming flights
        </p>
      </div>

      <div className="grid gap-6">
        {flights.map((flight) => (
          <div 
            key={flight.flight_number} 
            className="bg-white rounded-lg shadow-md p-6"
          >
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
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      Flight Time
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Departure:</span>
                        <span className="ml-2">
                          {formatDateTime(flight.departure_time)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Arrival:</span>
                        <span className="ml-2">
                          {formatDateTime(flight.arrival_time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      Route
                    </div>
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
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Pending Tasks
                    </h3>
                    <button 
                      onClick={() => setShowTaskInput(flight.flight_number)}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Task
                    </button>
                  </div>
                  
                  {showTaskInput === flight.flight_number && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          type="text"
                          name="task_name"
                          value={newTask.task_name}
                          onChange={handleNewTaskChange}
                          placeholder="Task Name"
                          className="w-full p-2 border rounded-md"
                          required
                        />
                        <textarea
                          name="description"
                          value={newTask.description}
                          onChange={handleNewTaskChange}
                          placeholder="Task Description"
                          className="w-full p-2 border rounded-md"
                          required
                        />
                        <input
                          type="number"
                          name="crew_required"
                          value={newTask.crew_required}
                          onChange={handleNewTaskChange}
                          placeholder="Crew Required"
                          className="w-full p-2 border rounded-md"
                          required
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleAddTask}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                          >
                            Save Task
                          </button>
                          <button
                            onClick={() => setShowTaskInput(null)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {flight.pending_tasks.map((task, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800">
                            {task.task_name}
                          </span>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            <span>Crew: {task.crew_required}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {task.description}
                        </p>
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