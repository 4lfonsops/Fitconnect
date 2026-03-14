import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const openSidebar = () => setSidebarOpen(true)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-surface text-text flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={closeSidebar} />}
      <div className="flex-1 flex flex-col">
        <AdminTopbar onMenuClick={openSidebar} />
        <main className="flex-1 px-4 py-6 xl:px-8 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
