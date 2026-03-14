import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-text flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 md:px-8 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
