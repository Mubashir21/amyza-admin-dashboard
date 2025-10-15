"use client";

import { useRouter } from "next/navigation";
import { TeacherCard } from "./teacher-card";
import { Teacher } from "@/lib/teachers-services";

interface TeachersGridProps {
  teachers: Teacher[];
  onTeachersUpdated?: () => void;
}

export function TeachersGrid({ teachers, onTeachersUpdated }: TeachersGridProps) {
  const router = useRouter();

  const handleTeacherUpdated = () => {
    if (onTeachersUpdated) {
      onTeachersUpdated();
    } else {
      router.refresh();
    }
  };

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">No teachers found</div>
        <div className="text-sm text-muted-foreground mt-2">
          Add your first teacher to get started
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {teachers
        .filter((teacher) => teacher && teacher.id) // Filter out invalid teachers
        .map((teacher) => (
        <TeacherCard
          key={teacher.id}
          teacher={teacher}
          onTeacherUpdated={handleTeacherUpdated}
        />
      ))}
    </div>
  );
}
