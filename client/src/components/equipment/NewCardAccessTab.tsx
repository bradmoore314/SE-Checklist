import { Project } from "@shared/schema";

interface CardAccessTabProps {
  project: Project;
}

export default function CardAccessTab({ project }: CardAccessTabProps) {
  return (
    <div className="p-4">
      <div className="text-center text-gray-500 py-8">
        Card Access Points section removed as requested
      </div>
    </div>
  );
}