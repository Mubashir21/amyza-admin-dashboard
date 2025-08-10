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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Trophy, Search, Medal, Award, Target, TrendingUp } from "lucide-react";

export default function RankingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ResponsiveContainer>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rankings</h1>
            <p className="text-muted-foreground">
              View student rankings and performance metrics across all batches
            </p>
          </div>
          <Button>
            <Trophy className="mr-2 h-4 w-4" />
            Update Performance
          </Button>
        </div>
      </ResponsiveContainer>

      {/* Search/Filter Bar */}
      <ResponsiveContainer>
        <Card>
          <CardContent className="">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-10" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Filter by Batch</Button>
                <Button variant="outline">Export Rankings</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>

      {/* Ranking Stats */}
      <ResponsiveContainer>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Top Performer
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Sarah Johnson</div>
              <p className="text-xs text-muted-foreground">
                9.2/10 overall score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.8/10</div>
              <p className="text-xs text-muted-foreground">
                Across all students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Most Improved
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Mike Davis</div>
              <p className="text-xs text-muted-foreground">
                +1.5 points this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                Across 3 active batches
              </p>
            </CardContent>
          </Card>
        </div>
      </ResponsiveContainer>

      {/* Top Performers */}
      <ResponsiveContainer>
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Performers</CardTitle>
            <CardDescription>
              Students ranked by overall performance score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => {
                const score = (9.5 - i * 0.3).toFixed(1);
                const getRankIcon = (rank: number) => {
                  if (rank === 1)
                    return <Trophy className="h-5 w-5 text-yellow-500" />;
                  if (rank === 2)
                    return <Medal className="h-5 w-5 text-gray-400" />;
                  if (rank === 3)
                    return <Award className="h-5 w-5 text-orange-500" />;
                  return (
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      #{rank}
                    </div>
                  );
                };

                const getRankBadge = (rank: number) => {
                  if (rank <= 3)
                    return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
                  if (rank <= 5) return "bg-blue-100 text-blue-800";
                  return "bg-gray-100 text-gray-800";
                };

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getRankIcon(i + 1)}
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">S{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Student Name {i + 1}</p>
                          <Badge className={getRankBadge(i + 1)}>
                            Rank #{i + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          STU00{i + 1} • Batch 2024-A
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right min-w-[100px]">
                        <p className="text-lg font-bold">{score}/10</p>
                        <p className="text-xs text-muted-foreground">
                          Overall Score
                        </p>
                      </div>

                      <div className="w-24">
                        <Progress
                          value={parseFloat(score) * 10}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-xs text-center min-w-[120px]">
                        <div>
                          <p className="font-medium">95%</p>
                          <p className="text-muted-foreground">Attend.</p>
                        </div>
                        <div>
                          <p className="font-medium">8.5</p>
                          <p className="text-muted-foreground">Tech</p>
                        </div>
                        <div>
                          <p className="font-medium">9.0</p>
                          <p className="text-muted-foreground">Comm.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>

      {/* Performance Categories Breakdown */}
      <ResponsiveContainer>
        <Card>
          <CardHeader>
            <CardTitle>Performance Categories</CardTitle>
            <CardDescription>
              Average scores across different performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { category: "Creativity", score: 8.2, color: "bg-purple-500" },
                { category: "Leadership", score: 7.8, color: "bg-blue-500" },
                { category: "Behavior", score: 9.1, color: "bg-green-500" },
                {
                  category: "Presentation",
                  score: 7.5,
                  color: "bg-orange-500",
                },
                { category: "Communication", score: 8.0, color: "bg-pink-500" },
                {
                  category: "Technical Skills",
                  score: 7.9,
                  color: "bg-indigo-500",
                },
                {
                  category: "General Performance",
                  score: 8.3,
                  color: "bg-red-500",
                },
              ].map((metric, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{metric.category}</p>
                    <p className="text-lg font-bold">{metric.score}/10</p>
                  </div>
                  <Progress value={metric.score * 10} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Class average
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    </div>
  );
}
