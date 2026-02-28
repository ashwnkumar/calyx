"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const formattedDate = formatDistanceToNow(new Date(project.created_at), {
    addSuffix: true,
  });

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
    >
      <CardHeader>
        <CardTitle className="text-xl">{project.name}</CardTitle>
        {project.description && (
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Created {formattedDate}</p>
      </CardContent>
    </Card>
  );
}
