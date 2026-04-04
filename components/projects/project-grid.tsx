"use client";

import { motion } from "framer-motion";
import { ProjectCard } from "./project-card";

type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  env_vars: { count: number }[];
};

type ProjectGridProps = {
  projects: Project[];
  onProjectDeleted: (projectId: string) => void;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
};

export function ProjectGrid({ projects, onProjectDeleted }: ProjectGridProps) {
  return (
    <motion.div
      className="columns-1 sm:columns-2 lg:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {projects.map((project) => (
        <motion.div
          key={project.id}
          variants={item}
          className="break-inside-avoid"
        >
          <ProjectCard project={project} onProjectDeleted={onProjectDeleted} />
        </motion.div>
      ))}
    </motion.div>
  );
}
