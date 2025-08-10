import { CreateBatchDialog } from "@/components/create-batch-dialogue";

interface BatchesHeaderProps {
  title?: string;
  description?: string;
}

export function BatchesHeader({
  title = "Batches",
  description = "Manage student batches and manually control module progression",
}: BatchesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <CreateBatchDialog />
    </div>
  );
}
