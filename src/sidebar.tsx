"use client";

import { Mic, SquareLibrary, Upload, ChartBar, ChevronUp } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "./utils/tailwind";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "./components/ui/avatar";
import { useMemo } from "react";
import { createClient } from "./lib/supabase/client";
import { redirect } from "next/navigation";

const projects = [
  { name: "Recording", url: "/recording", icon: <Mic /> },
  { name: "Library", url: "/library", icon: <SquareLibrary /> },
  { name: "Import", url: "/import", icon: <Upload /> },
  { name: "Analysis", url: "/analysis", icon: <ChartBar /> },
];

const SidebarPage = () => {
  const pathname = usePathname();

  const supabase = useMemo(() => createClient(), []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    console.log(error);

    if (error) {
      console.error("Logout error:", error.message);
      redirect("/login");
    } else {
      console.log("User signed out successfully");
      redirect("/login");
    }
  };

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
      <SidebarFooter className="border border-gray-200 bg-white cursor-pointer">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer ">
                <SidebarMenuButton>
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                  </Avatar>
                  John Doe
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-full min-w-42">
                <DropdownMenuItem className="cursor-pointer">
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  Log out
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarPage;
