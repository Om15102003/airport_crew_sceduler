import React from 'react';
import { useState } from 'react';
import { Calendar, Clock, Plane, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
const NewFlight = () => {
  const {airline}=useParams();
  const [formData, setFormData] = useState({
    airline: airline,
    flight_number: '',
    departure_time: '',
    arrival_time: '',
    destination: '',
    origin: '',
    schedule_date: ''
  });
  const [loading, setLoading] = useState(false);
  
  // console.log(airline);

  const handleBack = () => {
    window.history.back();
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return '';
    // Combine date and time and format as YYYY-MM-DD HH:mm:ss
    const [hours, minutes] = time.split(':');
    const dateObj = new Date(date);
    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);
    dateObj.setSeconds(0);
    
    return dateObj.toISOString().slice(0, 19).replace('T', ' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    
    // Format the dates for backend
    const formattedData = {
      ...formData,
      departure_time: formatDateTime(formData.schedule_date, formData.departure_time),
      arrival_time: formatDateTime(formData.schedule_date, formData.arrival_time)
    };
    formData.airline=airline;
    //console.log(formData);
    if(formData.airline.length>0){
    try {
      console.log('Formatted data for submission:', formattedData);
      // Add your API call here
      // await submitFlightData(formattedData);
      const response=await fetch('http://localhost:4000/flights',{
        method:'POST',
        headers:{
            Accept:'application/json',
            'Content-Type':'application/json',
        },
        body:JSON.stringify(formattedData),
    });
    const data=await response.json()
    
        
        
        if(data.message){
          alert('Flight Added');
          formData.arrival_time="";
          formData.departure_time='';
          formData.destination='';
          formData.flight_number='';
          formData.origin='';
          formData.schedule_date='';
        }else{
          alert('Failed');
        }


      setLoading(false);
      // Reset form or show success message
      
    } catch (error) {
      console.error('Error submitting flight:', error);
      setLoading(false);
    }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                ← Back
              </button>
              </div>
              <div className="justify-self-center text-center">
                
                {airline.length > 0 && <h1 className="text-[40px] font-medium text-blue-500 text-center">{airline}</h1>}
                
                <p className="text-gray-600 mt-1">
                  Flight Schedule Dashboard
                </p>
              </div>
            
            <div className="text-gray-600">
              Today: {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Form Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Add New Flight</h2>
                <p className="mt-1 text-sm text-gray-500">Create a new upcoming flight schedule</p>
              </div>
              <Plane className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Airline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Airline</label>
              <input
                type="text"
                value={airline}
                disabled
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
              />
            </div>

            {/* Flight Number */}
            <div>
              <label htmlFor="flight_number" className="block text-sm font-medium text-gray-700 mb-2">
                Flight Number
              </label>
              <input
                type="text"
                id="flight_number"
                name="flight_number"
                value={formData.flight_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter flight number"
              />
            </div>

            {/* Schedule Date */}
            <div>
              <label htmlFor="schedule_date" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Date
                </div>
              </label>
              <input
                type="date"
                id="schedule_date"
                name="schedule_date"
                value={formData.schedule_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Departure Time
                  </div>
                </label>
                <input
                  type="time"
                  id="departure_time"
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Arrival Time
                  </div>
                </label>
                <input
                  type="time"
                  id="arrival_time"
                  name="arrival_time"
                  value={formData.arrival_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Origin
                  </div>
                </label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter origin city"
                />
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Destination
                  </div>
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter destination city"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${
                  loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
              >
                {loading ? 'Adding Flight...' : 'Add Flight'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewFlight;