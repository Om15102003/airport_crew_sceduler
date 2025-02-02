import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CrewMemberDetails = () => {
    const { crewId } = useParams();
    const [crewMember, setCrewMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCrewMember = async () => {
            try {
                const response = await fetch(`http://localhost:4000/about-crew?crewId=${crewId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCrewMember(data.crewMember);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch crew member details');
                setLoading(false);
                console.error('Error fetching crew member:', err);
            }
        };

        fetchCrewMember();
    }, [crewId]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (!crewMember) {
        return <div className="text-center">Crew member not found</div>;
    }

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
                    style={activeNavLinkStyle}
                >
                    About Me
                </a>
                <a 
                    href={`/work/${crewId}`} 
                    style={navLinkStyle}
                    onMouseOver={(e) => e.target.style.color = "#1976d2"}
                    onMouseOut={(e) => e.target.style.color = "#555"}
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

            <main className="main-content mt-6">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 style={{ color: '#1976d2', fontSize: "40px", fontWeight: "500" }}>
                            Crew Member Details
                        </h1>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Basic Information */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 style={{ fontSize: "30px", fontWeight: "500" }}>
                                    Basic Information
                                </h3>
                                <span style={{
                                    padding: "0.3rem 1rem",
                                    fontSize: "0.875rem",
                                    borderRadius: "999px",
                                    backgroundColor: crewMember.status === 'active' ? "#d1fae5" : "#e5e7eb",
                                    color: crewMember.status === 'active' ? "#065f46" : "#374151",
                                }}>
                                    {crewMember.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">Name</p>
                                    <p className="font-medium text-gray-900">{crewMember.name}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="font-medium text-gray-900">{crewMember.email}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                                    <p className="font-medium text-gray-900">{crewMember.phone_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* Work Information */}
                        <div>
                            <h3 style={{ fontSize: "30px", fontWeight: "500" }}>
                                Work Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">Airline</p>
                                    <p className="font-medium text-gray-900">{crewMember.airline}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">Base City</p>
                                    <p className="font-medium text-gray-900">{crewMember.city}</p>
                                </div>
                            </div>
                        </div>

                        {/* Roles */}
                        <div>
                            <h3 style={{ fontSize: "30px", fontWeight: "500" }}>
                                Roles
                            </h3>
                            <div className="space-y-3">
                                {crewMember.roles && crewMember.roles.map((role) => (
                                    <div 
                                        key={role.role_id}
                                        style={{
                                            backgroundColor: "#f9fafb",
                                            padding: "1rem",
                                            borderRadius: "8px",
                                            border: "1px solid #e5e7eb",
                                            transition: "border 0.3s",
                                        }}
                                        onMouseOver={(e) => e.target.style.border = "1px solid #d1d5db"}
                                        onMouseOut={(e) => e.target.style.border = "1px solid #e5e7eb"}
                                    >
                                        <p style={{ fontWeight: "500", color: "#111827" }}>
                                            {role.role_name}
                                        </p>
                                        <p style={{ fontSize: "14px", color: "#6b7280" }}>
                                            {role.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CrewMemberDetails;
