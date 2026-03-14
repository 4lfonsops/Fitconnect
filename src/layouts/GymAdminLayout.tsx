import { Outlet } from 'react-router-dom'
import GymAdminSidebar from '../components/GymAdminSidebar'
import GymAdminTopbar from '../components/GymAdminTopbar'

const GymAdminLayout = () => {
  return (
    <div className="min-h-screen bg-surface text-text flex">
      <GymAdminSidebar />
      <div className="flex-1 flex flex-col">
        <GymAdminTopbar />
        <main className="flex-1 px-4 py-6 xl:px-8 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default GymAdminLayout
