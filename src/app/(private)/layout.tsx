import { SidebarProvider } from '@/components/ui/sidebar'
import SidebarPage from '@/sidebar'

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SidebarPage />
      <div className="w-full">{children}</div>
    </SidebarProvider>
  )
}
