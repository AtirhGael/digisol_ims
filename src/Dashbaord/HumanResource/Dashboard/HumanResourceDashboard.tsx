
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {Users, 
  UserPlus, 
  Calendar, 
  ClipboardList, 
  FileText, 
  CheckCircle, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
  Ellipsis
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/other/Card';
import { Table, Header, HeaderRow, HeaderCell, Body, Row, Cell } from '@table-library/react-table-library/table';


export const HumanResourceDashboard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState("");
  const [openActionId, setOpenActionId] = useState(null);

  const employees = [
    { id: 'EMP-001', name: 'Mr Gael A.', department: 'Development', role: 'Senior Developer', status: 'Active', hireDate: '2020-01-15' },
    { id: 'EMP-002', name: 'Mme Ebah P.', department: 'Finance', role: 'Accountant', status: 'Active', hireDate: '2019-05-20' },
    { id: 'EMP-003', name: 'Mr Eugene N.', department: 'Sales', role: 'Sales Manager', status: 'Active', hireDate: '2021-03-10' },
    { id: 'EMP-004', name: 'Ms Favour M.', department: 'HR', role: 'HR Specialist', status: 'Active', hireDate: '2018-11-30' },
    { id: 'EMP-006', name: 'Mr Elvis M.', department: 'Development', role: 'Junior Developer', status: 'On Leave', hireDate: '2022-07-01' },
  ];

  // Filtered employees for table
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.role.toLowerCase().includes(employeeSearch.toLowerCase());
    const matchesStatus = employeeStatusFilter ? emp.status.toLowerCase() === employeeStatusFilter.toLowerCase() : true;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const leaveRequests = [
    { name: 'Mr Samuel', type: 'Casual Leave', date: 'Jun 15-17 (3 days)' },
    { name: 'Mr Eugene', type: 'Sick Leave', date: 'Jul 20 (1 days)' },
    { name: 'Mr Carl', type: 'Annual Leave', date: 'Dec 22 - Jan 04 (2 weeks)' },
  ];

  const performanceReviews = [
    { name: 'Mr Atirh Gael', department: 'Development', due: 'Nov 30 2025', status: 'Pending' },
    { name: 'Mme Ebeh', department: 'Finance', due: 'Dec 05 2025', status: 'Scheduled' },
    { name: 'Ms Stephania', department: 'Sales', due: 'Dec 15 2025', status: 'Scheduled' },
    { name: 'Mr Samuel', department: 'Operations', due: 'Nov 12 2025', status: 'Overdue' },
  ];

  const recentActivities = [
    { icon: Users, title: 'New employee onboarded', subtitle: 'TIWA DELAH', time: '2 hours ago' },
    { icon: FileText, title: 'Leave request approved', subtitle: 'Ms Favour', time: '3 hours ago' },
    { icon: ClipboardList, title: 'Performance review completed', subtitle: 'System', time: '5 hours ago' },
    { icon: CheckCircle, title: 'Attendance record updated', subtitle: 'HR System', time: '1 day ago' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Human Resources Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500">Dashboard Overview</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="text-xs sm:text-sm" onClick={() => navigate('/dashboard/attendance')}>
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Mark Attendance</span>
              <span className="sm:hidden">Attendance</span>
            </Button>
            <Button variant="outline" buttonType="download" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" className="text-xs sm:text-sm">
              <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button
              buttonType="add" className="text-xs sm:text-sm" onClick={() => navigate('/dashboard/employees')}>
              <span className="hidden sm:inline">Add employee</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ overflow: 'visible' }}>
        {/* Quick Actions */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 w-full fit md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button onClick={() => navigate('/dashboard/employees')} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Add Employee</span>
            </button>
            <button onClick={() => navigate('/dashboard/leavemanagement')} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Manage Leave</span>
            </button>
            <button onClick={() => navigate('/dashboard/performance')} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Performance Review</span>
            </button>
            <button onClick={() => navigate('/dashboard/reports')} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Generate Report</span>
            </button>
          </div>
        </div>

        {/* Stats Cards using Card component */}
        <div className="grid grid-cols-1 w-full fit md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card
            heading="Total Employees"
            amount="15"
            icons={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
            currency={"↗ 8.2% vs last month"}
          />
          <Card
            heading="Present Today"
            amount="14"
            icons={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
            currency={"↗ 2.3% vs last period"}
          />
          <Card
            heading="Pending Requests"
            amount="8"
            icons={<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
            currency={"↗ 42.5% vs last week"}
          />
          <Card
            heading="Open Positions"
            amount="7"
            icons={<ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
            currency={"↗ 16.7% vs last period"}
          />
        </div>


        {/* Employee Records Table - Styled to match Attendance Table parent container */}
        <div className="w-full rounded-2xl py-4 px-5 bg-white mb-4 sm:mb-6 relative" style={{ overflow: 'visible' }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <div>
              <h3 className="font-medium text-lg">Employee Records</h3>
              <p className="text-xs sm:text-sm text-gray-500">All employees Records</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <select
                className="border border-gray-200 rounded-sm px-2 py-1 text-sm text-gray-500"
                value={employeeStatusFilter}
                onChange={e => setEmployeeStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
              </select>
              <input
                type="text"
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-full sm:w-48 text-gray-500"
                placeholder="Search by name, department, or role..."
                value={employeeSearch}
                onChange={e => setEmployeeSearch(e.target.value)}
              />
              <Button variant="outline" buttonType="download" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button buttonType="add" className="text-xs sm:text-sm" onClick={() => navigate('/dashboard/employees')}>
                <span className="hidden md:inline">Add Employee</span>
                <span className="md:hidden">Add</span>
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <Table data={{nodes: paginatedEmployees}}>
              {(list: typeof paginatedEmployees) => (
                <>
                  <Header>
                    <HeaderRow>
                      <HeaderCell className="text-left py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Employee Name</HeaderCell>
                      <HeaderCell className="text-left py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Employee ID</HeaderCell>
                      <HeaderCell className="text-left py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Department</HeaderCell>
                      <HeaderCell className="text-left py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Role</HeaderCell>
                      <HeaderCell className="text-left py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Status</HeaderCell>
                      <HeaderCell className="text-left py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Hire Date</HeaderCell>
                      <HeaderCell className="text-left py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">Actions</HeaderCell>
                    </HeaderRow>
                  </Header>
                  <Body>
                    {list.map((emp: typeof paginatedEmployees[number]) => (
                      <Row key={emp.id} item={emp} className="hover:bg-gray-50 transition-colors">
                        <Cell className="font-normal text-black text-sm py-3! border-b-gray-200 border-b">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300" />
                            <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">{emp.name}</span>
                          </div>
                        </Cell>
                        <Cell className="font-normal text-black text-sm py-3! border-b-gray-200 border-b">{emp.id}</Cell>
                        <Cell className="font-normal text-black text-sm py-3! border-b-gray-200 border-b">{emp.department}</Cell>
                        <Cell className="font-normal text-black text-sm py-3! border-b-gray-200 border-b">{emp.role}</Cell>
                        <Cell className="font-normal text-black text-sm py-3! border-b-gray-200 border-b">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{emp.status}</span>
                        </Cell>
                        <Cell className="font-normal text-black text-sm py-3! border-b-gray-200 border-b">{emp.hireDate}</Cell>
                        <Cell className="font-normal text-gray-400 text-sm py-3! border-b-gray-200 border-b relative">
                          <Button
                            className="px-4 py-1 hover:text-secondary cursor-pointer duration-100"
                            onClick={() => setOpenActionId(openActionId === emp.id ? null : emp.id)}
                          >
                            <Ellipsis />
                          </Button>
                          {openActionId === emp.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white shadow rounded-lg z-50 border">
                              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-t-lg">View</button>
                              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-b-lg">Delete</button>
                            </div>
                          )}
                        </Cell>
                      </Row>
                    ))}
                  </Body>
                </>
              )}
            </Table>
          </div>
          <div className="flex justify-between mt-4 items-center">
            <span className="text-xs text-gray-400">
              Showing page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex gap-1 items-center">
              <Button variant="outline" className="text-xs sm:text-sm" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>
                First
              </Button>
              <Button variant="outline" className="text-xs sm:text-sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>
                Previous
              </Button>
              <span className="text-xs border bg-secondary rounded-sm text-white py-1 px-2">{currentPage + 1}</span>
              <Button variant="outline" className="text-xs sm:text-sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
                Next
              </Button>
              <Button variant="outline" className="text-xs sm:text-sm" onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}>
                Last
              </Button>
            </div>
          </div>
        </div>

        {/* Charts and Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Attendance Trends */}
          <div className="bg-white rounded-lg p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Attendance Trends</h3>
            <p className="text-sm text-gray-500 mb-4">Monthly attendance patterns and leave trends</p>
            <div className="h-64 relative flex justify-start items-start">
              <svg className="h-full" viewBox="0 0 600 240">
                {/* Grid lines */}
                <line x1="40" y1="200" x2="560" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="40" y1="150" x2="560" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="40" y1="100" x2="560" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="40" y1="50" x2="560" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="40" y1="0" x2="560" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Y-axis labels */}
                <text x="30" y="205" fontSize="10" fill="#6b7280" textAnchor="end">0</text>
                <text x="30" y="155" fontSize="10" fill="#6b7280" textAnchor="end">25</text>
                <text x="30" y="105" fontSize="10" fill="#6b7280" textAnchor="end">50</text>
                <text x="30" y="55" fontSize="10" fill="#6b7280" textAnchor="end">75</text>
                <text x="30" y="5" fontSize="10" fill="#6b7280" textAnchor="end">100</text>
                
                {/* Present % Line (Green - top line around 90-95%) */}
                <polyline
                  points="80,15 160,20 240,18 320,22 400,25 480,20"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                />
                {['80,15', '160,20', '240,18', '320,22', '400,25', '480,20'].map((point, i) => (
                  <circle key={i} cx={point.split(',')[0]} cy={point.split(',')[1]} r="3" fill="#10B981" />
                ))}
                
                {/* Leaves % Line (Yellow - middle line around 5-8%) */}
                <polyline
                  points="80,185 160,182 240,180 320,178 400,183 480,180"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
                {['80,185', '160,182', '240,180', '320,178', '400,183', '480,180'].map((point, i) => (
                  <circle key={i} cx={point.split(',')[0]} cy={point.split(',')[1]} r="3" fill="#F59E0B" />
                ))}
                
                {/* Absent % Line (Red - bottom line around 2-5%) */}
                <polyline
                  points="80,192 160,190 240,194 320,191 400,188 480,193"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                />
                {['80,192', '160,190', '240,194', '320,191', '400,188', '480,193'].map((point, i) => (
                  <circle key={i} cx={point.split(',')[0]} cy={point.split(',')[1]} r="3" fill="#EF4444" />
                ))}
                
                {/* X-axis labels */}
                <text x="80" y="220" fontSize="12" fill="#6b7280" textAnchor="middle">Jun</text>
                <text x="160" y="220" fontSize="12" fill="#6b7280" textAnchor="middle">Jul</text>
                <text x="240" y="220" fontSize="12" fill="#6b7280" textAnchor="middle">Aug</text>
                <text x="320" y="220" fontSize="12" fill="#6b7280" textAnchor="middle">Sep</text>
                <text x="400" y="220" fontSize="12" fill="#6b7280" textAnchor="middle">Oct</text>
                <text x="480" y="220" fontSize="12" fill="#6b7280" textAnchor="middle">Nov</text>
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Absent %</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Leaves %</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Present %</span>
              </div>
            </div>
          </div>

          {/* Leave Request Status */}
          <div className="bg-white rounded-lg p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Leave Request Status</h3>
            <p className="text-sm text-gray-500 mb-6">Current month distribution</p>
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="20" strokeDasharray="188 251" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="20" strokeDasharray="75 251" strokeDashoffset="-188" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#EF4444" strokeWidth="20" strokeDasharray="31 251" strokeDashoffset="-263" transform="rotate(-90 50 50)" />
                </svg>
              </div>
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Approved</span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Pending</span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Rejected</span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Pending Leave Requests */}
          <div className="bg-white rounded-lg w-full h-fit p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Pending Leave Requests</h3>
                <p className="text-sm text-gray-500">Requires approval</p>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {leaveRequests.map((req, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{req.name}</p>
                      <p className="text-sm text-gray-600">{req.type}</p>
                      <p className="text-xs text-gray-500 mt-1">{req.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="text-xs">
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruitment Pipeline */}
          <div className="bg-white rounded-lg w-full h-fit p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recruitment Pipeline</h3>
                <p className="text-sm text-gray-500">Active recruitment status</p>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:underline">View Details</a>
            </div>
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 600 240">
                {/* Y-axis */}
                <line x1="60" y1="20" x2="60" y2="200" stroke="#e5e7eb" strokeWidth="2" />
                
                {/* X-axis */}
                <line x1="60" y1="200" x2="560" y2="200" stroke="#e5e7eb" strokeWidth="2" />
                
                {/* Grid lines */}
                <line x1="120" y1="200" x2="120" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1="200" y1="200" x2="200" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1="280" y1="200" x2="280" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1="360" y1="200" x2="360" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1="440" y1="200" x2="440" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1="520" y1="200" x2="520" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                
                {/* X-axis labels */}
                <text x="120" y="230" fontSize="12" fill="#6b7280" textAnchor="middle">10</text>
                <text x="200" y="230" fontSize="12" fill="#6b7280" textAnchor="middle">20</text>
                <text x="280" y="230" fontSize="12" fill="#6b7280" textAnchor="middle">30</text>
                <text x="360" y="230" fontSize="12" fill="#6b7280" textAnchor="middle">40</text>
                <text x="440" y="230" fontSize="12" fill="#6b7280" textAnchor="middle">50</text>
                <text x="520" y="230" fontSize="12" fill="#6b7280" textAnchor="middle">60</text>
                
                {/* Bars */}
                {/* Applications - 50 */}
                <rect x="65" y="45" width="460" height="30" fill="#3B82F6" rx="4" />
                <text x="38" y="63" fontSize="11" fill="#374151" textAnchor="end" fontWeight="500">Applications</text>
                
                {/* Screening - 35 */}
                <rect x="65" y="95" width="322" height="30" fill="#3B82F6" rx="4" />
                <text x="38" y="113" fontSize="11" fill="#374151" textAnchor="end" fontWeight="500">Screening</text>
                
                {/* Interviews - 20 */}
                <rect x="65" y="145" width="184" height="30" fill="#3B82F6" rx="4" />
                <text x="38" y="163" fontSize="11" fill="#374151" textAnchor="end" fontWeight="500">Interviews</text>
                
                {/* Offer - 8 */}
                <rect x="65" y="185" width="74" height="12" fill="#3B82F6" rx="4" />
                <text x="38" y="193" fontSize="11" fill="#374151" textAnchor="end" fontWeight="500">Offer</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Leave Requests and Recruitment Pipeline (duplicate removed) */}
        {/* Performance Reviews */}
        <div className="bg-white rounded-lg p-5 mt-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Performance Reviews</h3>
              <p className="text-sm text-gray-500">Upcoming and overdue reviews</p>
            </div>
            <ClipboardList className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {performanceReviews.map((review, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                  <p className="text-xs text-gray-600">{review.department}</p>
                  <p className="text-xs text-gray-500 mt-1">Due: {review.due}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  review.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  review.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {review.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-5 mt-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest HR activities</p>
            </div>
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1"></div>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <activity.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-600">{activity.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};