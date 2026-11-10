import { Trophy, Home, Sun, Moon, LogOut, UserPlus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CONFIG } from "@/config/constants";
import { useTheme } from "@/hooks/useTheme";
import toast from "react-hot-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Ranking", url: "/ranking", icon: Trophy },
  { title: "Cadastros", url: "/cadastros", icon: UserPlus },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const isCollapsed = state === "collapsed";

  // Check user level of access
  const user = localStorage.getItem("user");
  const levelOfAccess = user ? JSON.parse(user).levelOfAccess : 0;
  
  // Filter menu items based on level of access
  const filteredMenuItems = menuItems.filter(item => {
    if (item.url === "/dashboard" && levelOfAccess === 1) {
      return false;
    }
    return true;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            theme === "dark" ? <img src="/comet-wordmark.png" alt={CONFIG.PLATFORM_NAME} className="h-8 w-auto" /> :
              <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"><img src="/comet-symbol.png" alt="" className="h-8 w-8" />{CONFIG.PLATFORM_NAME}</div>
          )}
          {isCollapsed && (
            <img
              src="/comet-symbol.png"
              alt={CONFIG.PLATFORM_NAME}
              className="h-8 w-auto"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex sidebarItem items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {!isCollapsed && (
            <span className="ml-2">
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4 sidebarDanger" />
          {!isCollapsed && <span className="ml-2 alert sidebarDanger">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
