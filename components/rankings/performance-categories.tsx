import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Lightbulb, 
  Users, 
  Heart, 
  Presentation, 
  MessageCircle, 
  Code, 
  BarChart 
} from "lucide-react";

interface PerformanceCategory {
  category: string;
  score: number;
  color: string;
}

interface PerformanceCategoriesProps {
  categories: PerformanceCategory[];
}

const categoryInfo = [
  {
    name: "Creativity",
    icon: Lightbulb,
    description: "Measures innovative thinking, problem-solving approaches, and ability to think outside the box",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    name: "Leadership",
    icon: Users,
    description: "Evaluates ability to guide others, take initiative, and inspire team collaboration",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "Behavior",
    icon: Heart,
    description: "Assesses professionalism, respect, punctuality, and overall conduct in the learning environment",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    name: "Presentation",
    icon: Presentation,
    description: "Evaluates ability to effectively communicate ideas, deliver presentations, and engage audiences",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    name: "Communication",
    icon: MessageCircle,
    description: "Measures clarity in expressing ideas, active listening skills, and interpersonal communication",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    name: "Technical Skills",
    icon: Code,
    description: "Assesses proficiency in technical concepts, practical application, and problem-solving ability",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    name: "General Performance",
    icon: BarChart,
    description: "Overall assessment considering work quality, consistency, effort, and improvement over time",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
];

export function PerformanceCategories({
  categories,
}: PerformanceCategoriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Evaluation Guide</CardTitle>
        <CardDescription>
          Understanding how students are evaluated across different performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryInfo.map((category, i) => {
            const Icon = category.icon;
            return (
              <div key={i} className={`p-4 border rounded-lg ${category.bgColor} transition-all hover:shadow-md`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white ${category.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
