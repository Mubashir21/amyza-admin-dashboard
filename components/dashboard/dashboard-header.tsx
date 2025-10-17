interface DashboardHeaderProps {
  title?: string;
  description?: string;
}

export function DashboardHeader({
  title = "Dashboard",
  description = "Welcome back! Here's what's happening in your student portfolio system.",
}: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
