import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const RecentActivities = (props) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/recent-activities/${props.airline}`);
        const data = await response.json();
        setActivities(data.recent_activities);
        setLoading(false);
        console.log(activities);
      } catch (error) {
        console.error('Error fetching flights data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [props.airline]);

  if (!activities || activities.length === 0) {
    return <p>No recent activities available for this airline.</p>;
  }

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    
    // Format date
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Format time
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      date: formattedDate,
      time: formattedTime
    };
  };

  console.log(activities);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recent Activities</h2>
        <div className="flex items-center text-gray-500">
          <Clock size={20} className="mr-2" />
          <span>Live Updates</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const { date, time } = formatDateTime(activity.activity_time);
          return (
            <div
              key={activity.activity_id}
              className="flex items-start p-4 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex-shrink-0 w-32 text-sm font-medium text-gray-600">
                <div className="text-gray-400">{date}</div>
                <div className="mt-1">{time}</div>
              </div>
              
              <div className="flex-grow ml-4">
                <p className="text-gray-700">{activity.activity_description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivities;