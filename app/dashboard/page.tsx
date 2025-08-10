// ===== app/dashboard/page.tsx =====

import { ResponsiveContainer } from "@/components/responsive-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Calendar,
  Trophy,
  Target,
  BookOpen,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Calendar as CalendarIcon,
} from "lucide-react";

export default function AdvancedDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Advanced Header with Quick Actions */}
      <ResponsiveContainer>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening in your student portfolio
              system.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
            <Button size="sm">
              <Users className="mr-2 h-4 w-4" />
              Quick Actions
            </Button>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Enhanced Stats Cards with Trends */}
      <ResponsiveContainer>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600">+12%</span>
                <span className="ml-1">from last month</span>
              </div>
              <Progress value={75} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Batches
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600">+2</span>
                <span className="ml-1">new this quarter</span>
              </div>
              <Progress value={80} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Attendance
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92.5%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                <span className="text-red-600">-2.1%</span>
                <span className="ml-1">from last week</span>
              </div>
              <Progress value={92.5} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Performance Score
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.4/10</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600">+0.3</span>
                <span className="ml-1">this month</span>
              </div>
              <Progress value={84} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </div>
      </ResponsiveContainer>

      {/* Advanced Tabs Layout */}
      <ResponsiveContainer>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Main Chart Area */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Student Progress Analytics</CardTitle>
                  <CardDescription>
                    Performance trends across all batches over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center space-y-2">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Chart Component
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Interactive analytics would go here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Side Stats */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates from your system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: "New student enrolled",
                        time: "2 min ago",
                        type: "success",
                        icon: CheckCircle,
                      },
                      {
                        action: "Attendance marked for Batch A",
                        time: "15 min ago",
                        type: "info",
                        icon: Calendar,
                      },
                      {
                        action: "Performance updated",
                        time: "1 hour ago",
                        type: "warning",
                        icon: Trophy,
                      },
                      {
                        action: "Low attendance alert",
                        time: "2 hours ago",
                        type: "error",
                        icon: AlertTriangle,
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            item.type === "success"
                              ? "bg-green-100 text-green-600"
                              : item.type === "info"
                              ? "bg-blue-100 text-blue-600"
                              : item.type === "warning"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <item.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Batch Performance Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">
                        Batch 2024-Q{i + 1}-A
                      </CardTitle>
                      <CardDescription>{25 + i * 5} students</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Batch
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-bold">
                          {60 + i * 15}%
                        </span>
                      </div>
                      <Progress value={60 + i * 15} className="h-2" />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Attendance</p>
                          <p className="font-medium">{90 + i * 2}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Score</p>
                          <p className="font-medium">{7.5 + i * 0.3}/10</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>
                    Students with highest scores this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === 0
                                ? "bg-yellow-100 text-yellow-800"
                                : i === 1
                                ? "bg-gray-100 text-gray-800"
                                : i === 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {i + 1}
                          </div>
                          {i < 3 && (
                            <Star className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>S{i + 1}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Student Name {i + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            STU00{i + 1}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {(9.5 - i * 0.2).toFixed(1)}/10
                          </p>
                          <div className="flex items-center text-xs text-green-600">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +0.{i + 2}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Categories</CardTitle>
                  <CardDescription>
                    Average scores by skill category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { skill: "Technical Skills", score: 8.2, trend: "up" },
                      { skill: "Communication", score: 7.8, trend: "up" },
                      { skill: "Leadership", score: 7.5, trend: "down" },
                      { skill: "Creativity", score: 8.0, trend: "up" },
                      { skill: "Presentation", score: 7.3, trend: "down" },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {item.skill}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">
                              {item.score}/10
                            </span>
                            {item.trend === "up" ? (
                              <ArrowUpRight className="h-3 w-3 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-600" />
                            )}
                          </div>
                        </div>
                        <Progress value={item.score * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-green-600">85%</div>
                    <p className="text-sm text-muted-foreground">
                      Students Present
                    </p>
                    <div className="text-xs text-muted-foreground">
                      108 of 127 students
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-blue-600">92%</div>
                    <p className="text-sm text-muted-foreground">
                      Average Attendance
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Across all batches
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-orange-600">
                      -2.1%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      vs Last Week
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Slight decrease
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Heatmap</CardTitle>
                <CardDescription>
                  Attendance patterns by day and batch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center space-y-2">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Attendance Heatmap
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Visual attendance patterns would display here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>
                    Important notifications requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        type: "warning",
                        title: "Low Attendance Alert",
                        message: "Batch 2024-Q1-B has 75% attendance this week",
                        time: "2 hours ago",
                      },
                      {
                        type: "info",
                        title: "Batch Completion",
                        message: "Batch 2024-Q4-A will complete in 2 weeks",
                        time: "1 day ago",
                      },
                      {
                        type: "success",
                        title: "Performance Milestone",
                        message: "Sarah Johnson achieved 9.5/10 overall score",
                        time: "2 days ago",
                      },
                      {
                        type: "error",
                        title: "System Maintenance",
                        message: "Scheduled maintenance this weekend",
                        time: "3 days ago",
                      },
                    ].map((alert, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border-l-4 ${
                          alert.type === "warning"
                            ? "bg-orange-50 border-orange-500"
                            : alert.type === "info"
                            ? "bg-blue-50 border-blue-500"
                            : alert.type === "success"
                            ? "bg-green-50 border-green-500"
                            : "bg-red-50 border-red-500"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">
                              {alert.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {alert.time}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </ResponsiveContainer>
    </div>
  );
}
