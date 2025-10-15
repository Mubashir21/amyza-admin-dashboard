import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PerformanceCategory {
  category: string;
  score: number;
  color: string;
}

interface PerformanceCategoriesProps {
  categories: PerformanceCategory[];
}

export function PerformanceCategories({
  categories,
}: PerformanceCategoriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Categories</CardTitle>
        <CardDescription>
          Average scores across different performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((metric, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{metric.category}</p>
                <p className="text-lg font-bold">
                  {metric.score.toFixed(1)}/10
                </p>
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
  );
}
