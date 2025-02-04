import { useState } from "react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    airline: "",
    city: "",
    roles: [],
    userType: "crew", // Default user type
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...formData.roles];
    updatedRoles[index][field] = value;
    setFormData({ ...formData, roles: updatedRoles });
  };

  const addRole = () => {
    setFormData({
      ...formData,
      roles: [...formData.roles, { roleName: "", description: "" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = formData.userType === "crew" ? "/crew/signup" : "/admin/signup";
    const payload = formData.userType === "crew"
      ? {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
          airline: formData.airline,
          city: formData.city,
          roles: formData.roles,
        }
      : {
          name: formData.name,
          email: formData.email,
          password_hash: formData.password,
          airline: formData.airline,
          city: formData.city,
        };

    try {
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      alert(result.message || "Signup successful");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Error during signup. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>
        <select
          name="userType"
          value={formData.userType}
          onChange={handleChange}
          className="mb-4 w-full p-2 border rounded"
        >
          <option value="crew">Crew Member</option>
          <option value="admin">Admin</option>
        </select>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Name" onChange={handleChange} required className="w-full p-2 border rounded" />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full p-2 border rounded" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full p-2 border rounded" />
          <input type="text" name="airline" placeholder="Airline" onChange={handleChange} required className="w-full p-2 border rounded" />
          <input type="text" name="city" placeholder="City" onChange={handleChange} required className="w-full p-2 border rounded" />
          {formData.userType === "crew" && (
            <>
              <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleChange} required className="w-full p-2 border rounded" />
              {formData.roles.map((role, index) => (
                <div key={index} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Role Name"
                    value={role.roleName}
                    onChange={(e) => handleRoleChange(index, "roleName", e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Role Description"
                    value={role.description}
                    onChange={(e) => handleRoleChange(index, "description", e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
              <button type="button" onClick={addRole} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">+ Add Role</button>
            </>
          )}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}
