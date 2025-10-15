import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award } from "lucide-react";

interface RankedStudent {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  batch_code: string;
  overall_score: number;
  attendance_percentage: number;
  technical_score: number;
  communication_score: number;
  rank: number;
}

interface RankingsListProps {
  students: RankedStudent[];
}

export function RankingsList({ students }: RankingsListProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
    return (
      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
        #{rank}
      </div>
    );
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Students ranked by overall performance score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">
              No rankings data available
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Student performance scores need to be calculated
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top {Math.min(students.length, 10)} Performers</CardTitle>
        <CardDescription>
          Students ranked by overall performance score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.slice(0, 10).map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {getRankIcon(student.rank)}
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {student.first_name[0]}
                    {student.last_name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.student_id} • {student.batch_code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right min-w-[100px]">
                  <p className="text-lg font-bold">
                    {student.overall_score.toFixed(1)}/10
                  </p>
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                </div>

                <div className="w-24">
                  <Progress
                    value={student.overall_score * 10}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 text-xs text-center min-w-[120px]">
                  <div>
                    <p className="font-medium">
                      {student.attendance_percentage}%
                    </p>
                    <p className="text-muted-foreground">Attend.</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {student.technical_score.toFixed(1)}
                    </p>
                    <p className="text-muted-foreground">Tech</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {student.communication_score.toFixed(1)}
                    </p>
                    <p className="text-muted-foreground">Comm.</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
