import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// --- Types ---
interface NotificationItemProps {
  user?: string;
  avatar?: string;
  action: string;
  time: string;
  title?: string;
  isNew?: boolean;
}

// --- Sub-Component for individual notification cards ---
const NotificationRow: React.FC<NotificationItemProps> = ({ 
  user, 
  avatar, 
  action, 
  time, 
  title 
}) => (
  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow mb-3">
    <div className="flex items-center gap-3">
      {avatar ? (
        <img 
          src={avatar} 
          alt={user || title || ''} 
          className="w-11 h-11 rounded-full object-cover flex-shrink-0" 
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <div className="w-6 h-6 bg-white rounded-sm"></div>
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900 text-[15px]">
            {user || title}
          </span>
          <span className="text-[12px] text-gray-400">{time}</span>
        </div>
        <p className="text-[13px] text-gray-600 mt-0.5">{action}</p>
      </div>
    </div>
    <button className="text-[#38BDF8] text-[13px] font-medium hover:underline ml-4 flex-shrink-0">
      View
    </button>
  </div>
);

// --- Main Notification Component ---
export const Notification = () => {
  const [isMondayExpanded, setIsMondayExpanded] = useState(false);

  const toggleMondaySection = () => {
    setIsMondayExpanded(!isMondayExpanded);
  };

  return (
    <div className="w-full  ">
      {/* Header Section .. */  }
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <p className="text-gray-500 text-[14px] mb-4">
            Review the latest system alerts and important updates.
          </p>
          <p className="text-[14px] text-gray-700">
            You have <span className="text-[#38BDF8] font-semibold">6</span> new notifications
          </p>
        </div>
        
        <button className="bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-all text-[14px] shadow-sm">
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-8">
        {/* Today Group */}
        <section>
          <h3 className="text-[12px] font-semibold text-gray-500 mb-4 uppercase tracking-wider">
            Today
          </h3>
          <div>
            <NotificationRow 
              user="Marinette Njomo" 
              avatar="https://i.pravatar.cc/150?u=marinette" 
              action="Uploaded a document" 
              time="3m ago" 
            />
            <NotificationRow 
              title="Upcoming Event" 
              action="Weekly Business Review" 
              time="1h ago" 
            />
            <NotificationRow 
              user="Marinette Njomo" 
              avatar="https://i.pravatar.cc/150?u=marinette" 
              action="Added a new record to business development project record" 
              time="3h ago" 
            />
          </div>
        </section>

        {/* Yesterday Group */}
        <section>
          <h3 className="text-[12px] font-semibold text-gray-500 mb-4 uppercase tracking-wider">
            Yesterday
          </h3>
          <div>
            <NotificationRow 
              title="Upcoming Event" 
              action="Weekly Business Review" 
              time="Yesterday" 
            />
            <NotificationRow 
              title="Upcoming Event" 
              action="Weekly Business Review" 
              time="Yesterday" 
            />
            <NotificationRow 
              user="Marinette Njomo" 
              avatar="https://i.pravatar.cc/150?u=marinette" 
              action="Uploaded a document" 
              time="Yesterday" 
            />
          </div>
        </section>

        {/* Monday Group */}
        <section>
          <div 
            className="flex justify-between items-center cursor-pointer group py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            onClick={toggleMondaySection}
          >
            <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
              Monday
            </h3>
            <ChevronDown 
              size={18} 
              className={`text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${
                isMondayExpanded ? 'transform rotate-180' : ''
              }`}
            />
          </div>
          {isMondayExpanded && (
            <div className="mt-4">
              <NotificationRow 
                user="John Doe" 
                avatar="https://i.pravatar.cc/150?u=john" 
                action="Completed project milestone review" 
                time="Monday" 
              />
              <NotificationRow 
                title="System Update" 
                action="Database maintenance completed successfully" 
                time="Monday" 
              />
              <NotificationRow 
                user="Sarah Wilson" 
                avatar="https://i.pravatar.cc/150?u=sarah" 
                action="Submitted weekly report" 
                time="Monday" 
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Notification;
