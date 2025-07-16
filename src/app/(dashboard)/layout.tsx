import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/component/dashboard-navbar";
import { DashboardSiderbar } from "@/modules/dashboard/ui/component/dashboard-sidebar";

interface Props {
    children: React.ReactNode;
}

const Layout = ({children}: Props) => {
    return (
        <SidebarProvider>
            <DashboardSiderbar />
            <main className="flex flex-col h-screen w-screen bg-muted">
                <DashboardNavbar />
                {children}
            </main>
        </SidebarProvider>
    )
}

export default Layout;