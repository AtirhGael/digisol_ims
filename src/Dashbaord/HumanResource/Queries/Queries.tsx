import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/other/Card';
import { Button } from '../../../components/ui/button';
import { HeadingComponent } from '../../../components/other/HeadingComponent';
import ReusableTable from '../../../components/other/ReusableTable/ReusableTable';
import { createQueryColumns } from '../../../components/Columns/QueryColumns';

const Queries = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Open Queries');
  const [statusFilter, setStatusFilter] = useState('Open');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tab → filter value map
  const TAB_FILTER: Record<string, string> = {
    'Open Queries': 'Open',
    'In Progress': 'In Progress',
    'Resolved': 'Resolved',
    'All Queries': '',
  };

  // Filter value → tab name map (for ReusableTable dropdown sync)
  const FILTER_TAB: Record<string, string> = {
    'Open': 'Open Queries',
    'In Progress': 'In Progress',
    'Resolved': 'Resolved',
    '': 'All Queries',
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    setStatusFilter(TAB_FILTER[tabName] ?? '');
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setActiveTab(FILTER_TAB[value] ?? 'All Queries');
  };

  const stats = [
    {
      title: 'Open Queries',
      value: '23',
      subtitle: 'Request',
      icon: Mail,
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      title: 'In Progress',
      value: '23',
      subtitle: 'Approved',
      icon: MessageSquare,
      gradient: 'from-gray-100 to-gray-200',
      textColor: 'text-gray-800',
    },
    {
      title: 'Resolved This Month',
      value: '23',
      subtitle: 'Staffs',
      icon: CheckCircle,
      gradient: 'from-gray-100 to-gray-200',
      textColor: 'text-gray-800',
    },
    {
      title: 'Avg Resolution(days)',
      value: '23',
      subtitle: 'Available',
      icon: Clock,
      gradient: 'from-gray-100 to-gray-200',
      textColor: 'text-gray-800',
      subtitleColor: 'text-yellow-500',
    },
  ];

  const tabs = [
    { name: 'Open Queries', active: activeTab === 'Open Queries', badge: true },
    { name: 'In Progress', active: activeTab === 'In Progress' },
    { name: 'Resolved', active: activeTab === 'Resolved' },
    { name: 'All Queries', active: activeTab === 'All Queries' },
  ];

  const queries = [
    {
      id: 'Q-2024-001',
      submittedDate: '2024-01-15',
      employee: 'John Doe',
      category: 'IT Support',
      status: 'Open',
      priority: 'High',
      assignedTo: 'Sarah Johnson',
      dueDate: '2024-01-20',
    },
    {
      id: 'Q-2024-002',
      submittedDate: '2024-01-16',
      employee: 'Jane Smith',
      category: 'HR',
      status: 'Open',
      priority: 'Medium',
      assignedTo: 'Mike Brown',
      dueDate: '2024-01-22',
    },
    {
      id: 'Q-2024-003',
      submittedDate: '2024-01-17',
      employee: 'Bob Wilson',
      category: 'Payroll',
      status: 'Open',
      priority: 'Low',
      assignedTo: 'Emily Davis',
      dueDate: '2024-01-25',
    },
    {
      id: 'Q-2024-004',
      submittedDate: '2024-01-18',
      employee: 'Alice Cooper',
      category: 'Leave',
      status: 'Open',
      priority: 'High',
      assignedTo: 'David Lee',
      dueDate: '2024-01-21',
    },
    {
      id: 'Q-2024-005',
      submittedDate: '2024-01-19',
      employee: 'Tom Harris',
      category: 'Benefits',
      status: 'Open',
      priority: 'Medium',
      assignedTo: 'Lisa White',
      dueDate: '2024-01-23',
    },
    {
      id: 'Q-2024-006',
      submittedDate: '2024-01-20',
      employee: 'Sarah Davis',
      category: 'IT Support',
      status: 'In Progress',
      priority: 'High',
      assignedTo: 'John Smith',
      dueDate: '2024-01-24',
    },
    {
      id: 'Q-2024-007',
      submittedDate: '2024-01-21',
      employee: 'Michael Brown',
      category: 'Payroll',
      status: 'Resolved',
      priority: 'Low',
      assignedTo: 'Emma Wilson',
      dueDate: '2024-01-26',
    },
  ];

  const columns = createQueryColumns({
    openMenuId,
    onToggleMenu: (id) => setOpenMenuId(id),
    onView: (_id) => {},
    onDelete: (_id) => {},
  });

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl">
        {/* Title Section */}
        <div className="mb-8 flex items-center justify-between">
          <HeadingComponent
            heading="Staff Queries & Issues"
            subHeading="Submit, track and resolve employee queries and issues"
          />
          <Button buttonType="add" variant="default" size="lg" onClick={() => navigate('/dashboard/queries/add')}>
            Submit New Query
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                heading={stat.title}
                amount={stat.value}
                currency={stat.subtitle}
                icons={<stat.icon className="h-5 w-5 text-white" />}
              />
            ))}
          </div>
        </div>

        {/* Tabs — each tab pre-sets the status filter */}
        <div className="mb-6 flex gap-8 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(tab.name)}
              className={`relative pb-4 text-sm font-semibold transition whitespace-nowrap ${
                tab.active ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
              {tab.active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* ReusableTable — selectedFilter stays in sync with active tab */}
        <ReusableTable
          heading="Queries Management"
          columns={columns}
          data={queries}
          filterKey="status"
          filterOptions={[
            { key: 'Open', label: 'Open', value: 'Open' },
            { key: 'In Progress', label: 'In Progress', value: 'In Progress' },
            { key: 'Resolved', label: 'Resolved', value: 'Resolved' },
          ]}
          searchKeys={['id', 'employee', 'category', 'assignedTo']}
          selectedFilter={statusFilter}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
};

export default Queries;

