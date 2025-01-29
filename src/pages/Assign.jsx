import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plane, 
  Users, 
  Calendar, 
  Clock,
  ArrowLeft,
  Plus,
  Trash2
} from 'lucide-react';

import TaskAssignmentResults  from './TaskAssignmentResults';

const AdminDashboard = () => {
  const { flightNumber, adminId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [groupedCrewMembers, setGroupedCrewMembers] = useState({});
  const [newTask, setNewTask] = useState({
    flight_number: flightNumber,
    id: '',
    task_name: '',
    description: '',
    crew_required: ''
  });
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [taskAssignments, setTaskAssignments] = useState(null);
const [showAssignments, setShowAssignments] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:4000/crew-members?adminId=${adminId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const formattedData = data.map(member => ({
          ...member,
          start_time: member.start_time.slice(0, 5),
          end_time: member.end_time.slice(0, 5),
        }));
        setCrewMembers(formattedData);
        
        const grouped = formattedData.reduce((acc, member) => {
          const key = member.crew_id;
          if (!acc[key]) {
            acc[key] = {
              crew_id: key,
              roles: [],
              name: member.name,
              available: member.available,
              shifts: new Set()
            };
          }
          acc[key].roles.push({
            role_name: member.role_name,
            role_description: member.role_description
          });
          acc[key].shifts.add(`${member.start_time} - ${member.end_time}`);
          return acc;
        }, {});

        Object.values(grouped).forEach(member => {
          member.shifts = Array.from(member.shifts);
        });

        setGroupedCrewMembers(grouped);
      })
      .catch((err) => {
        console.error('Error fetching crew members:', err);
      });
  }, [adminId]);

  useEffect(() => {
    fetch(`http://localhost:4000/tasks/flight?flightNumber=${flightNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const transformedTasks = data.tasks.map((task) => ({
          id: task.id,
          flight_id: task.flight_id,
          task_name: task.task_name,
          description: task.description,
          crew_required: task.crew_required,
          role_name: task.task_name.split(' ')[0],
        }));
        setTasks(transformedTasks);
      })
      .catch((err) => {
        console.error('Error fetching tasks:', err);
      });
  }, [flightNumber]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDeleteTask = async (taskId, flightNumber, task_name) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    if (!flightNumber || !task_name) {
      alert('Flight number and task name are required');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/delete-task', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flight_number: flightNumber,
          task_name: task_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      alert('Error deleting task: ' + error.message);
    }
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTask = async () => {
    if (!newTask.task_name || !newTask.description || !newTask.crew_required) {
      alert('Please fill in all task details');
      return;
    }

    const transformedTask = {
      flight_number: flightNumber,
      task_name: newTask.task_name,
      description: newTask.description,
      crew_required: newTask.crew_required,
    };

    const newTaskId = tasks.length + 1;

    try {
      const response = await fetch('http://localhost:4000/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedTask),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      setTasks([
        ...tasks,
        {
          id: newTaskId,
          flight_id: flightNumber,
          task_name: newTask.task_name,
          description: newTask.description,
          crew_required: newTask.crew_required,
          role_name: newTask.task_name.split(' ')[0],
        },
      ]);

      setNewTask({
        task_name: '',
        description: '',
        crew_required: '',
      });
      setShowTaskInput(false);
    } catch (error) {
      alert('Error adding task: ' + error.message);
    }
  };

  const preprocessData = (tasks, crewMembers) => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const crewArray = Array.isArray(crewMembers) ? crewMembers : [];
    
    const formattedTasks = taskArray.map(task => ({
      id: task.id,
      flight_id: parseInt(flightNumber),
      task_name: task.task_name,
      description: task.description,
      crew_required: parseInt(task.crew_required),
      role_name: task.task_name.split(' ')[0]
    }));
    
    const formattedCrewMembers = crewArray.map(crew => ({
      id: crew.crew_id,
      available: crew.available === 1 || crew.available === true,
      start_time: crew.start_time,
      end_time: crew.end_time,
      role_name: crew.role_name,
      role_description: crew.role_description
    }));
    
    return {
      tasks: formattedTasks,
      crew_members: formattedCrewMembers
    };
  };

  const sendScheduleRequest = async (requestData) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending schedule request:', error);
      throw error;
    }
  };

  const handleConfirmTasks = async () => {
    try {
      const processedData = preprocessData(tasks, crewMembers);
      console.log('Processed data:', processedData);

      const response = await sendScheduleRequest(processedData);
      console.log('Schedule response:', response);

      alert('Tasks scheduled successfully!');
      setTaskAssignments(response);
      setShowAssignments(true);
    } catch (error) {
      alert(`Failed to schedule tasks: ${error.message}`);
    }
  };


  // Add this new function to handle saving assignment changes:
const handleSaveAssignments = async (updatedAssignments) => {
  try {
    // Add your API call here to save the updated assignments
    const response = await fetch('http://localhost:4000/update-assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedAssignments),
    });

    if (!response.ok) {
      throw new Error('Failed to update assignments');
    }

    setTaskAssignments(updatedAssignments);
    alert('Assignments updated successfully!');
  } catch (error) {
    alert(`Failed to update assignments: ${error.message}`);
  }
};

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBackClick}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <div>
          <button
            onClick={() => setShowTaskInput(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </button>
          <button
            onClick={handleConfirmTasks}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Confirm Tasks
          </button>
        </div>
      </div>

      {showAssignments && taskAssignments && (
      <TaskAssignmentResults
        assignments={taskAssignments}
        tasks={tasks}
        crewMembers={crewMembers}
        onSaveChanges={handleSaveAssignments}
        onClose={() => setShowAssignments(false)}
      />
    )}

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-[40px] font-[500]" style={{ color: '#1976d2' }}>
        Flight {flightNumber} - Pending Tasks
      </h1>

      {showTaskInput && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
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
                onClick={() => setShowTaskInput(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg shadow-md p-6 relative">
            <button
              onClick={() => handleDeleteTask(task.id, flightNumber, task.task_name)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{task.task_name}</h2>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Crew: {task.crew_required}</span>
                </div>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600">{task.description}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
        Crew Members
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(groupedCrewMembers).map((crewMember) => (
          <div key={crewMember.crew_id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {crewMember.name || `Crew Member ${crewMember.crew_id}`}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <div className="flex flex-col">
                    {crewMember.shifts.map((shift, index) => (
                      <span key={index} className="mb-1">{shift}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                crewMember.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {crewMember.available ? 'Available' : 'Unavailable'}
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Roles:</h4>
              {crewMember.roles.map((role, index) => (
                <div key={index} className="mb-2 pl-2 border-l-2 border-blue-200">
                  <p className="font-medium text-gray-800">{role.role_name}</p>
                  <p className="text-sm text-gray-600">{role.role_description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;