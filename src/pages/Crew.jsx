// import React from 'react';
// import { useState,useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useParams } from 'react-router-dom';
// const Crew = () => {
//   const navigate = useNavigate();
// //   const [crewMembers] = useState([
// //     {
// //       crew_name: "John Doe",
// //       crew_email: "john.doe@airline.com",
// //       phn_no: "+1-234-567-8900",
// //       availability_date: "2025-01-21",
// //       start_time: "08:00",
// //       end_time: "16:00",
// //       role_name: "Ground Handler",
// //       role_description: "Responsible for aircraft ground handling operations"
// //     }
// //   ]);
// const {adminId}=useParams();
//   const [crewMembers, setCrewMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//     //console.log(adminId);
    
//   useEffect(() => {
//     fetch(`http://localhost:4000/crew-members?adminId=${adminId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })
//       .then((response) => {
//         console.log(response.status);
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }
//         return response.json();
//       })
//       .then((data) => {
//         setCrewMembers(data); // Update the crew members data
//         setLoading(false); // Mark as loaded
//         console.log();
        
//       })
//       .catch((err) => {
//         console.error('Error fetching crew members:', err);
//         setError(err.message); // Handle errors
//         setLoading(false);
//       });
//   }, [adminId]);

//   if (loading) {
//     return <p>Loading crew members...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//   }


//   const formatDate = (isoDate) => {
//     try {
//       const date = new Date(isoDate);
  
//       if (isNaN(date)) {
//         throw new Error("Invalid Date");
//       }
  
//       // Format the date as 'Month Day, Year' (e.g., 'January 16, 2025')
//       return date.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//       });
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return "Invalid Date";
//     }
//   };

//   const handleBack = () => {
//     navigate(-1);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       {/* Back Button */}
//       <div className="max-w-7xl mx-auto mb-4">
//         <button 
//           onClick={handleBack}
//           className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
//         >
//           <svg 
//             xmlns="http://www.w3.org/2000/svg" 
//             className="h-5 w-5" 
//             fill="none" 
//             viewBox="0 0 24 24" 
//             stroke="currentColor"
//           >
//             <path 
//               strokeLinecap="round" 
//               strokeLinejoin="round" 
//               strokeWidth={2} 
//               d="M15 19l-7-7 7-7" 
//             />
//           </svg>
//           Back
//         </button>
//       </div>

//       <div className="max-w-7xl mx-auto space-y-6">
        
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-6 text-center">
//           <h1 
//             className="text-[40px] font-[500] mb-2"
//             style={{ color: '#1976d2' }}
//           >
//             Crew Members Dashboard
//           </h1>
//           <p className="text-gray-600 text-lg">
//             Manage and monitor your airline crew members
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
//             <p className="text-gray-600 text-lg font-medium mb-2">
//               Total Crew Members
//             </p>
//             <p className="text-3xl font-bold text-blue-600">
//               {crewMembers.length}
//             </p>
//           </div>
          
//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
//             <p className="text-gray-600 text-lg font-medium mb-2">
//               Available Today
//             </p>
//             <p className="text-3xl font-bold text-green-600">
//               {crewMembers.filter(crew => 
//                 crew.availability_date === "2025-01-21"
//               ).length}
//             </p>
//           </div>
          
//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
//             <p className="text-gray-600 text-lg font-medium mb-2">
//               Roles
//             </p>
//             <p className="text-3xl font-bold text-purple-600">
//               {new Set(crewMembers.map(crew => crew.role_name)).size}
//             </p>
//           </div>
//         </div>

//         {/* Crew List */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
//           <div className="p-6 border-b border-gray-200">
//             <h2 className="text-xl font-semibold text-gray-900 text-center">
//               Crew Members List
//             </h2>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Name
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Email
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Phone
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Availability
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Time
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Role
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {crewMembers.map((crews, index) => (
//                   <tr key={index} className="hover:bg-gray-50">
//                     <td className="px-6 py-4">
//                       <p className="text-sm font-medium text-gray-900">
//                         {crews.crew_name}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600">
//                         {crews.crew_email}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600">
//                         {crews.phn_no}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600">
//                         {formatDate(crews.availability_date)}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600">
//                         {crews.start_time} - {crews.end_time}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm font-medium text-gray-900">
//                         {crews.role_name}
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         {crews.role_description}
//                       </p>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Crew;



import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Crew = () => {
  const navigate = useNavigate();
  const {adminId} = useParams();
  const [crewMembers, setCrewMembers] = useState([]);
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
            {/* <h1 
              className="text-[40px] font-[500] text-center"
              style={{ color: '#1976d2' }}
            >
              Crew Members Dashboard
            </h1> */}
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
              Total Crew Members
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {crewMembers.length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 text-lg font-medium mb-2">
              Available Today
            </p>
            <p className="text-3xl font-bold text-green-600">
              {crewMembers.filter(crew => 
                crew.availability_date === "2025-01-21"
              ).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 text-lg font-medium mb-2">
              Roles
            </p>
            <p className="text-3xl font-bold text-purple-600">
              {new Set(crewMembers.map(crew => crew.role_name)).size}
            </p>
          </div>
        </div>

        {/* Crew List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              Crew Members List
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
                {crewMembers.map((crews, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {crews.crew_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {crews.crew_email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {crews.phn_no}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDate(crews.availability_date)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {crews.start_time} - {crews.end_time}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {crews.role_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {crews.role_description}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crew;