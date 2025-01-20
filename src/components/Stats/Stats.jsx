import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Simple Card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
    {children}
  </div>
);

const Stats = (props) => {
  // Sample data - in real application, this would come from props or API
//   const flightData = [
//     { id: 1, date: '2024-01-01', on_time_departure: true, on_time_arrival: true, crew_satisfaction: 'great', customer_satisfaction: 'good' },
//     { id: 2, date: '2024-01-02', on_time_departure: false, on_time_arrival: false, crew_satisfaction: 'bad', customer_satisfaction: 'bad' },
//     { id: 3, date: '2024-01-03', on_time_departure: true, on_time_arrival: true, crew_satisfaction: 'good', customer_satisfaction: 'great' },
//     { id: 4, date: '2024-01-04', on_time_departure: true, on_time_arrival: false, crew_satisfaction: 'great', customer_satisfaction: 'good' },
//     { id: 5, date: '2024-01-05', on_time_departure: false, on_time_arrival: true, crew_satisfaction: 'good', customer_satisfaction: 'good' }
//   ];

  const [flightData,setFlightData]=useState([]);
  const [loading, setLoading]=useState([]);

    useEffect(()=>{
        const fetchData=async ()=>{
            try{
            const response=await fetch(`http://localhost:4000/flights/airline/${props.airline}`);
            const data=await response.json();
            setFlightData(data.flights);
            setLoading(false);
            }catch(error){
                console.error('Error fetching flights data:',error);
                setLoading(false);
                
            }
        }
        fetchData();
    },[props.airline]);
    if (loading) {
        return <p>Loading...</p>;
      }
    
    

  // Calculate statistics
  const calculateStats = () => {
    const total = flightData.length;
    console.log(typeof flightData);
    
    const onTimeDepartures = flightData.filter(f => f.on_time_departure).length;
    const onTimeArrivals = flightData.filter(f => f.on_time_arrival).length;
    
    const crewSatisfactionStats = flightData.reduce((acc, curr) => {
      acc[curr.crew_satisfaction] = (acc[curr.crew_satisfaction] || 0) + 1;
      return acc;
    }, {});
    
    const customerSatisfactionStats = flightData.reduce((acc, curr) => {
      acc[curr.customer_satisfaction] = (acc[curr.customer_satisfaction] || 0) + 1;
      return acc;
    }, {});

    return {
      onTimeDepartures: (onTimeDepartures / total) * 100,
      onTimeArrivals: (onTimeArrivals / total) * 100,
      crewSatisfactionStats,
      customerSatisfactionStats
    };
  };

  const stats = calculateStats();

  // Prepare data for satisfaction comparison chart
  const satisfactionData = [
    { name: 'Bad', crew: stats.crewSatisfactionStats.bad || 0, customer: stats.customerSatisfactionStats.bad || 0 },
    { name: 'Good', crew: stats.crewSatisfactionStats.good || 0, customer: stats.customerSatisfactionStats.good || 0 },
    { name: 'Great', crew: stats.crewSatisfactionStats.great || 0, customer: stats.customerSatisfactionStats.great || 0 }
  ];

  // Prepare data for punctuality pie chart
  const punctualityData = [
    { name: 'On-time Departures', value: stats.onTimeDepartures },
    { name: 'Delayed Departures', value: 100 - stats.onTimeDepartures },
    { name: 'On-time Arrivals', value: stats.onTimeArrivals },
    { name: 'Delayed Arrivals', value: 100 - stats.onTimeArrivals }
  ];

  const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28'];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Flight Report</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Satisfaction Comparison Chart */}
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Satisfaction Comparison</h3>
            <BarChart width={400} height={300} data={satisfactionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="crew" fill="#8884d8" name="Crew Satisfaction" />
              <Bar dataKey="customer" fill="#82ca9d" name="Customer Satisfaction" />
            </BarChart>
          </div>

          {/* Punctuality Pie Charts */}
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Punctuality Statistics</h3>
            <div className="flex justify-between">
              <PieChart width={200} height={200}>
                <Pie
                  data={punctualityData.slice(0, 2)}
                  cx={100}
                  cy={100}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {punctualityData.slice(0, 2).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <PieChart width={200} height={200}>
                <Pie
                  data={punctualityData.slice(2, 4)}
                  cx={100}
                  cy={100}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {punctualityData.slice(2, 4).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div className="flex justify-around text-sm">
              <span>Departures</span>
              <span>Arrivals</span>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-50">
                <p className="text-2xl font-bold">
                  {Math.max(...Object.entries(stats.crewSatisfactionStats)
                    .map(([key, value]) => value))}
                </p>
                <p className="text-sm text-gray-600">Most Common Crew Rating</p>
              </Card>
              <Card className="bg-gray-50">
                <p className="text-2xl font-bold">
                  {Math.max(...Object.entries(stats.customerSatisfactionStats)
                    .map(([key, value]) => value))}
                </p>
                <p className="text-sm text-gray-600">Most Common Customer Rating</p>
              </Card>
              <Card className="bg-gray-50">
                <p className="text-2xl font-bold">{stats.onTimeDepartures.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">On-time Departures</p>
              </Card>
              <Card className="bg-gray-50">
                <p className="text-2xl font-bold">{stats.onTimeArrivals.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">On-time Arrivals</p>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Stats;