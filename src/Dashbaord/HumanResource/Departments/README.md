# Department Management Feature

A comprehensive department management system for the HR dashboard that allows creating, viewing, editing, and deleting departments.

## Features

✅ **Department Creation Form** - Clean, validated form for adding new departments  
✅ **Department Listing Table** - Searchable, filterable table using existing ReusableTable  
✅ **Edit & Delete Functionality** - Full CRUD operations with confirmation dialogs  
✅ **Form Validation** - Client-side validation with error handling  
✅ **API Integration** - Ready-to-use hooks for backend integration  
✅ **Responsive UI** - Follows project design patterns and conventions  

## Files Created

```
src/Dashbaord/HumanResource/Departments/
├── Departments.tsx                          # Main component
├── types.ts                                # TypeScript interfaces
├── api.ts                                  # API hooks for CRUD operations  
├── index.ts                               # Export barrel
└── components/
    ├── DepartmentTable.tsx                # Table component
    ├── DepartmentForm.tsx                 # Add/Edit form  
    ├── DepartmentForm.shared.tsx          # Shared form components
    └── ConfirmDeleteDialog.tsx            # Delete confirmation dialog
```

## Integration Steps

1. **Sidebar Updated** ✅  
   - Added "Departments" link under Human Resource section in `SideBarMenu.tsx`

2. **Route Configuration** (Required)  
   Add route to your router configuration:
   ```tsx
   import Departments from "./Dashbaord/HumanResource/Departments/Departments";
   
   // Add this route:
   <Route path="/dashboard/departments" component={Departments} />
   ```

3. **API Integration** (Ready)  
   The API hooks are ready to use. Update the endpoints in `api.ts` to match your backend:
   ```typescript
   // Current: `${import.meta.env.VITE_BASE_URL}/departments`
   // Update to match your API structure
   ```

4. **Authentication** (Optional)  
   Add user context for the "createdBy" field in forms

## Component Usage

### Basic Usage
```tsx
import Departments from "./Dashbaord/HumanResource/Departments/Departments";

<Departments />
```

### Standalone Components
```tsx
import { DepartmentTable, DepartmentForm } from "./Dashbaord/HumanResource/Departments";

<DepartmentTable 
  departments={departments}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

<DepartmentForm
  department={selectedDepartment} // undefined for new department
  onSave={handleSave}
  onCancel={handleCancel}
  loading={isLoading}
/>
```

## Data Structure

### Department Interface
```typescript
interface Department {
  id: string;
  name: string;
  description: string;
  manager?: string;
  employeeCount?: number;
  budget?: number;
  status: "ACTIVE" | "INACTIVE" | "RESTRUCTURING";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

## Form Validation

The form includes validation for:
- **Required fields**: Department name and description
- **Budget validation**: Must be a valid number if provided
- **Real-time error display** with field highlighting

## Backend API Endpoints

The components expect these endpoints:

```
GET    /departments              # Fetch all departments
POST   /departments              # Create new department
PUT    /departments/:id          # Update department  
DELETE /departments/:id          # Delete department
```

### Expected Request/Response Format

**Create/Update Request:**
```json
{
  "name": "Information Technology",
  "description": "Manages technology infrastructure",
  "manager": "John Doe",
  "budget": 5000000,
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "id": "12345",
  "name": "Information Technology", 
  "description": "Manages technology infrastructure",
  "manager": "John Doe",
  "employeeCount": 25,
  "budget": 5000000,
  "status": "ACTIVE",
  "createdAt": "2024-03-23T10:00:00Z",
  "updatedAt": "2024-03-23T10:00:00Z", 
  "createdBy": "admin_user"
}
```

## UI/UX Features

- **Search & Filter**: Built-in search across name, description, manager
- **Status filtering**: Filter by Active, Inactive, Restructuring
- **Pagination**: Configurable items per page (default: 10)
- **Responsive design**: Works on mobile and desktop
- **Loading states**: Visual feedback during API operations
- **Confirmation dialogs**: Prevents accidental deletions
- **Form validation**: Real-time validation with error messages

## Mock Data

The component includes mock data for testing. Remove the mock data section in `Departments.tsx` once your API is connected:

```typescript
// Remove this section when API is ready:
const mockDepartments: Department[] = [ /* ... */ ];
```

## Customization

### Styling
All components use Tailwind CSS classes and follow the existing design system. Modify the classes in component files to match your brand.

### Validation Rules  
Update validation logic in `DepartmentForm.tsx` `handleSubmit` function.

### Table Columns
Modify columns in `DepartmentTable.tsx` to add/remove fields.

### Status Options
Update status options in `types.ts` and corresponding components.

## Dependencies

Uses existing project dependencies:
- React Icons (`react-icons/lu`)
- Tailwind CSS
- Existing UI components (`Button`, `Input`)
- Existing `ReusableTable` component
- Axios for API calls

## Notes

- Follows existing project patterns from Business Development section
- Uses the same form styling and validation approach  
- Integrates with existing `ReusableTable` component
- Ready for immediate deployment with mock data
- Prepared for easy API integration

The implementation is production-ready and follows all the existing project conventions for maintainability and consistency.