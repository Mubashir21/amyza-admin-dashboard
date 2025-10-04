// Example usage patterns for permission-based UI components
import { useAuth } from "@/lib/auth-context";
import { canMarkTeacherAttendance, canManageTeachers, canManageStudents } from "@/lib/roles";
import { PermissionButton } from "@/components/ui/permission-button";
import { PermissionWrapper } from "@/components/ui/permission-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PermissionExamples() {
  const { userRole } = useAuth();

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Permission Examples</h2>

      {/* Example 1: Permission Button */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Button Example</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4">
          <PermissionButton
            hasPermission={canMarkTeacherAttendance(userRole)}
            permissionMessage="Only Super Admins can mark teacher attendance"
            variant="default"
          >
            Mark Teacher Attendance
          </PermissionButton>

          <PermissionButton
            hasPermission={canManageTeachers(userRole)}
            permissionMessage="Only Super Admins can add teachers"
            variant="outline"
          >
            Add New Teacher
          </PermissionButton>

          <PermissionButton
            hasPermission={canManageStudents(userRole)}
            permissionMessage="Only Super Admins and Admins can edit students"
            variant="secondary"
          >
            Edit Student
          </PermissionButton>
        </CardContent>
      </Card>

      {/* Example 2: Permission Wrapper */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Wrapper Example</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionWrapper
            hasPermission={canManageTeachers(userRole)}
            permissionMessage="Only Super Admins can manage teachers"
          >
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="font-semibold">Teacher Management Section</h3>
              <p className="text-sm text-gray-600">This entire section is disabled for viewers</p>
              <div className="space-x-2">
                <Button size="sm">Add Teacher</Button>
                <Button size="sm" variant="outline">Edit Teacher</Button>
                <Button size="sm" variant="destructive">Delete Teacher</Button>
              </div>
            </div>
          </PermissionWrapper>
        </CardContent>
      </Card>

      {/* Example 3: Conditional Styling */}
      <Card>
        <CardHeader>
          <CardTitle>Conditional Styling Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { action: 'Mark Teacher Attendance', permission: canMarkTeacherAttendance(userRole), role: 'Super Admin' },
              { action: 'Manage Students', permission: canManageStudents(userRole), role: 'Super Admin or Admin' },
              { action: 'View Data', permission: true, role: 'All Roles' },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  item.permission 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <h4 className="font-semibold">{item.action}</h4>
                <p className="text-sm text-gray-600">Required: {item.role}</p>
                <p className="text-sm font-medium">
                  Status: {item.permission ? '✅ Allowed' : '❌ Restricted'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Usage in real components:
export function TeacherManagementToolbar() {
  const { userRole } = useAuth();

  return (
    <div className="flex gap-2">
      <PermissionButton
        hasPermission={canManageTeachers(userRole)}
        permissionMessage="Only Super Admins can add teachers"
      >
        Add Teacher
      </PermissionButton>
      
      <PermissionButton
        hasPermission={canMarkTeacherAttendance(userRole)}
        permissionMessage="Only Super Admins can mark teacher attendance"
        variant="outline"
      >
        Mark Attendance
      </PermissionButton>
    </div>
  );
}
