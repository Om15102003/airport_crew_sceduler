import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Crew = () => {
  const navigate = useNavigate();
  const {adminId} = useParams();
  const [crewMembers, setCrewMembers] = useState([]);
  const [groupedCrewMembers, setGroupedCrewMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    
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
        setCrewMembers(data);
        // Group crew members by crew_id
        const grouped = data.reduce((acc, crew) => {
          if (!acc[crew.crew_id]) {
            acc[crew.crew_id] = [];
          }
          acc[crew.crew_id].push(crew);
          return acc;
        }, {});
        setGroupedCrewMembers(grouped);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching crew members:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [adminId]);

  if (loading) {
    return <p>Loading crew members...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const formatDate = (isoDate) => {
    try {
      const date = new Date(isoDate);
  
      if (isNaN(date)) {
        throw new Error("Invalid Date");
      }
  
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Get unique roles count across all crew members
  const uniqueRoles = new Set(crewMembers.map(crew => crew.role_name)).size;

  // // Get available today count
  // const availableToday = crewMembers.filter(crew => 
  //   crew.availability_date === "2025-01-21"
  // ).length;

 // Get today's date in IST (YYYY-MM-DD format)
const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

console.log("Today's Date in IST:", todayIST);

const availableToday = crewMembers.filter(crew => {
    // Convert crew.availability_date from UTC to IST and extract YYYY-MM-DD
    const crewDateIST = new Date(crew.availability_date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    return crewDateIST === todayIST;
}).length;

console.log("Available Crew Members Today:", availableToday);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button 
              onClick={handleBack}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Back
            </button>
          </div>
          <div className="text-gray-600">
            Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
      <h1 
        className="text-[40px] font-[500] text-center" 
        style={{ color: '#1976d2' }}
      >
        Crew Members Dashboard
      </h1>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 text-lg font-medium mb-2">
              Total Crews
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {Object.keys(groupedCrewMembers).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 text-lg font-medium mb-2">
              Available Today
            </p>
            <p className="text-3xl font-bold text-green-600">
              {availableToday}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 text-lg font-medium mb-2">
              Roles
            </p>
            <p className="text-3xl font-bold text-purple-600">
              {uniqueRoles}
            </p>
          </div>
        </div>

        {/* Grouped Crew List */}
        <div className="space-y-6">
          {Object.entries(groupedCrewMembers).map(([crewId, members]) => (
            <div key={crewId} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">
                  Crew ID: {crewId}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Availability
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((crew, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {crew.crew_name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {crew.crew_email}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {crew.phn_no}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {formatDate(crew.availability_date)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {crew.start_time} - {crew.end_time}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {crew.role_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {crew.role_description}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Crew;