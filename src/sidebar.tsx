"use client";

import { Mic, SquareLibrary, Upload, ChartBar } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "./utils/tailwind";

const projects = [
  { name: "Recording", url: "/recording", icon: <Mic /> },
  { name: "Library", url: "/library", icon: <SquareLibrary /> },
  { name: "Import", url: "/import", icon: <Upload /> },
  { name: "Analysis", url: "/analysis", icon: <ChartBar /> },
];

const SidebarPage = () => {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent className="bg-background p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-base text-primary-700 p-4">
            Recording Canvas
          </SidebarGroupLabel>
          <SidebarGroupContent className="p-2">
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem
                  key={project.name}
                  className={cn(
                    "rounded-2xl ",
                    pathname === project.url && "bg-primary-100"
                  )}
                >
                  <SidebarMenuButton asChild className="active:bg-primary-200">
                    <a
                      href={project.url}
                      className="text-base text-primary rounded-lg hover:bg-primary-100 cursor-pointer px-4 py-5 hover:rounded-full"
                    >
                      {project.icon}
                      <span>{project.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarPage;
