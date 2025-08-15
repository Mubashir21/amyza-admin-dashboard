import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveContainer } from "@/components/responsive-container";
import {
  Home,
  GraduationCap,
  Users,
  BarChart3,
  AlertTriangle,
  Trophy,
  Calendar,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background space-y-6 p-6">
      {/* Header */}
      <ResponsiveContainer>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>System</span>
          <span>/</span>
          <span>Error</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </ResponsiveContainer>

      {/* Main Content */}
      <ResponsiveContainer>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Error Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/20">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>404 - Page Not Found</CardTitle>
                    <CardDescription>
                      The requested resource could not be located
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Details */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">What happened?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • The page you&apos;re looking for doesn&apos;t exist
                    </li>
                    <li>• The URL might have been typed incorrectly</li>
                    <li>• The page may have been moved or deleted</li>
                    <li>• You might not have permission to access this page</li>
                  </ul>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/dashboard">
                      <Home className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/students">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      View Students
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/batches">
                      <Users className="mr-2 h-4 w-4" />
                      View Batches
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Sidebar */}
          <div className="space-y-6">
            {/* Quick Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Navigation</CardTitle>
                <CardDescription>
                  Jump to the most used sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Overview</div>
                    <div className="text-xs text-muted-foreground">
                      Dashboard home
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/students"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Students</div>
                    <div className="text-xs text-muted-foreground">
                      Manage students
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/batches"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Batches</div>
                    <div className="text-xs text-muted-foreground">
                      View all batches
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/attendance"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Attendance</div>
                    <div className="text-xs text-muted-foreground">
                      Track attendance
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/rankings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="p-1.5 rounded-md bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Rankings</div>
                    <div className="text-xs text-muted-foreground">
                      Student rankings
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">All Services</span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Authentication</span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Help Footer */}
      <ResponsiveContainer>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact your system administrator or check the
            <Link
              href="/dashboard"
              className="text-primary hover:underline ml-1"
            >
              main dashboard
            </Link>
            .
          </p>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
