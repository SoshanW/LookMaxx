import React from 'react';
import '../styles/ActivitySection.css';

const ActivitySection = () => {
  const activities = [
    { id: 1, type: 'Event', title: 'Plastic Surgeon Discussion', time: 'Tomorrow, 5:00 PM', participants: 28 },
    { id: 2, type: 'Discussion', title: 'Plastic Surgeon Discussion', time: 'Active now', participants: 64 },
    { id: 3, type: 'Challenge', title: 'Study section brainstorming', time: 'Ends in 3 days', participants: 42 }
  ];

  return (
    <section className="activity-section">
      <div className="section-header">
        <h2>Active Now</h2>
        <button className="view-all">See more</button>
      </div>
      
      <div className="activity-container">
        {activities.map(activity => (
          <div className="activity-item" key={activity.id}>
            <div className="activity-badge">{activity.type}</div>
            <div className="activity-details">
              <h3>{activity.title}</h3>
              <div className="activity-meta">
                <span className="activity-time">{activity.time}</span>
                <span className="activity-participants">{activity.participants} participants</span>
              </div>
            </div>
            <button className="join-activity">Join</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActivitySection;