import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Work = () => {
    const { crewId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completingTask, setCompletingTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, [crewId]);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`http://localhost:4000/crew-work?crewId=${crewId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTasks(data.tasks);
            
            
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch tasks');
            setLoading(false);
            console.error('Error fetching tasks:', err);
        }
    };

    const completeTask = async (taskId) => {
    // Show a confirmation alert before proceeding
    const isConfirmed = window.confirm("Are you sure you want to mark this task as completed?");

    if (!isConfirmed) return; // If the user cancels, exit the function
        setCompletingTask(taskId);
        console.log(tasks);
        console.log(taskId);
        console.log(crewId);
                
        try {
            const response = await fetch('http://localhost:4000/remove-crew-task', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    crewId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                // Remove the completed task from the list
                alert("Marking it as completed!");
                setTasks(tasks.filter(task => task.task_id !== taskId));
            } else {
                throw new Error(data.error || 'Failed to complete task');
            }
        } catch (err) {
            alert('Failed to mark task as completed. Please try again.');
            console.error('Error completing task:', err);
        } finally {
            setCompletingTask(null);
        }
    };

    const navStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #ddd",
        borderRadius: "8px",
        gap: "3rem",
    };

    const navLinkStyle = {
        textDecoration: "none",
        color: "#555",
        fontWeight: "500",
        padding: "0.5rem 1rem",
        position: "relative",
        transition: "background 0.3s, color 0.3s",
        borderRadius: "5px",
    };

    const activeNavLinkStyle = {
        ...navLinkStyle,
        backgroundColor: "#1976d2",
        color: "#fff",
    };

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            {/* Navigation Bar */}
            <nav style={navStyle}>
                <a
                    href={`/aboutcrew/${crewId}`}
                    style={navLinkStyle}
                    onMouseOver={(e) => e.target.style.color = "#1976d2"}
                    onMouseOut={(e) => e.target.style.color = "#555"}
                >
                    About Me
                </a>
                <a
                    href={`/work/${crewId}`}
                    style={activeNavLinkStyle}
                >
                    Work
                </a>
                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to logout?")) {
                            window.location.replace('/');
                        }
                    }}
                    style={{
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.3s",
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#b91c1c"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#dc2626"}
                >
                    Logout
                </button>
            </nav>

            <main className="mt-6">
                {loading ? (
                    <div className="text-center py-4">Loading tasks...</div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">No pending task as of now</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-4 text-gray-600">No tasks assigned at the moment.</div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Assigned Tasks</h2>
                        {tasks.map((task) => (
                            <div
                                key={task.task_id}
                                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-blue-300 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {task.task_name}
                                    </h3>
                                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        Flight {task.flight_number}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {task.description}
                                </p>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => completeTask(task.task_id)}
                                        disabled={completingTask === task.task_id}
                                        className={`px-4 py-2 rounded-md text-white font-medium 
                                            ${completingTask === task.task_id 
                                                ? 'bg-green-400 cursor-not-allowed' 
                                                : 'bg-green-500 hover:bg-green-600'} 
                                            transition-colors`}
                                    >
                                        {completingTask === task.task_id 
                                            ? 'Marking as Complete...' 
                                            : 'Mark as Complete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Work;