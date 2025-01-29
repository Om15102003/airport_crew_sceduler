import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const TaskAssignmentResults = ({ assignments, tasks, crewMembers, onSaveChanges, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [unassignedCrew, setUnassignedCrew] = useState([]);

  useEffect(() => {
    setCurrentAssignments(assignments);
    // Initialize unassigned crew - considering unique crew members
    const assignedCrewIds = assignments.map(a => a.crew_member_id);
    const uniqueCrewMembers = crewMembers.reduce((acc, curr) => {
      if (!acc.some(item => item.crew_id === curr.crew_id)) {
        acc.push(curr);
      }
      return acc;
    }, []);
    const unassigned = uniqueCrewMembers.filter(crew => 
      !assignedCrewIds.includes(crew.crew_id)
    );
    setUnassignedCrew(unassigned);
  }, [assignments, crewMembers]);

  const findTask = (taskId) => {
    return tasks.find(task => task.id === taskId) || {};
  };

  const findCrewMember = (crewId) => {
    // Get first occurrence since basic details are same for duplicate entries
    return crewMembers.find(crew => crew.crew_id === crewId) || {};
  };

  const getCrewRoles = (crewId) => {
    return crewMembers
      .filter(crew => crew.crew_id === crewId)
      .map(crew => crew.role_name)
      .join(', ');
  };

  const handleAssignCrew = (taskId, crewId) => {
    // Remove from unassigned if that's where they came from
    setUnassignedCrew(prev => prev.filter(c => c.crew_id !== crewId));
    
    // Add to assignments
    const newAssignment = {
      task_assignment_id: taskId,
      crew_member_id: crewId
    };
    
    setCurrentAssignments(prev => [...prev, newAssignment]);
  };

  const handleUnassignCrew = (taskId, crewId) => {
    setCurrentAssignments(prev => 
      prev.filter(a => !(a.task_assignment_id === taskId && a.crew_member_id === crewId))
    );
    
    const crew = findCrewMember(crewId);
    if (crew) {
      setUnassignedCrew(prev => [...prev, crew]);
    }
  };

  const handleSave = () => {
    const hasUnavailableCrew = currentAssignments.some(assignment => {
      const crewMember = findCrewMember(assignment.crew_member_id);
      return !crewMember.available;
    });

    if (hasUnavailableCrew) {
      setShowWarning(true);
      return;
    }

    onSaveChanges(currentAssignments);
    setIsEditing(false);
    setShowWarning(false);
  };

  const groupAssignmentsByTask = () => {
    const grouped = {};
    currentAssignments.forEach(assignment => {
      const taskId = assignment.task_assignment_id;
      if (!grouped[taskId]) {
        grouped[taskId] = [];
      }
      grouped[taskId].push(assignment);
    });
    return grouped;
  };

  return (
    <div className="p-4 bg-white rounded">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Task Assignments</h2>
        <div>
          {!isEditing ? (
            <div>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentAssignments(assignments);
                  setShowWarning(false);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {showWarning && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>Warning: Some assigned crew members are unavailable</span>
        </div>
      )}

      {isEditing && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Unassigned Crew Members:</h3>
          <div className="flex flex-wrap gap-2">
            {unassignedCrew.map(crew => (
              <div 
                key={crew.crew_id}
                className={`p-4 rounded ${
                  crew.available ? 'bg-blue-100 hover:bg-blue-200' : 'bg-red-100'
                }`}
              >
                <div className="font-medium">{crew.crew_name}</div>
                <div className="text-sm text-gray-600">Roles: {getCrewRoles(crew.crew_id)}</div>
                <div className="text-sm text-gray-600">
                  {crew.start_time} - {crew.end_time}
                </div>
                {!crew.available && (
                  <span className="text-xs text-red-600">(Unavailable)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupAssignmentsByTask()).map(([taskId, taskAssignments]) => {
          const task = findTask(parseInt(taskId));
          return (
            <div key={taskId} className="border rounded p-4">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold">{task.task_name}</h3>
                <span className="text-gray-500">
                  Crew: {taskAssignments.length} / {task.crew_required}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{task.description}</p>
              
              <div className="space-y-2">
                {taskAssignments.map((assignment) => {
                  const crewMember = findCrewMember(assignment.crew_member_id);
                  return (
                    <div 
                      key={`${assignment.task_assignment_id}-${assignment.crew_member_id}`}
                      className="flex justify-between items-center bg-gray-50 p-4 rounded"
                    >
                      <div>
                        <div className="font-medium">{crewMember.crew_name}</div>
                        <div className="text-sm text-gray-600">
                          Roles: {getCrewRoles(crewMember.crew_id)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {crewMember.start_time} - {crewMember.end_time}
                        </div>
                        {!crewMember.available && (
                          <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                            Unavailable
                          </span>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleUnassignCrew(parseInt(taskId), crewMember.crew_id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {isEditing && taskAssignments.length < task.crew_required && (
                <div className="mt-4">
                  <div className="p-3 border border-dashed border-gray-300 rounded bg-gray-50">
                    {unassignedCrew.length > 0 ? (
                      <div className="space-y-2">
                        {unassignedCrew.map(crew => (
                          <button
                            key={crew.crew_id}
                            onClick={() => handleAssignCrew(parseInt(taskId), crew.crew_id)}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium">{crew.crew_name}</div>
                              <div className="text-sm text-gray-600">
                                Roles: {getCrewRoles(crew.crew_id)}
                              </div>
                            </div>
                            <span className="text-blue-500 text-sm">Assign</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center">
                        No unassigned crew members available
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskAssignmentResults;