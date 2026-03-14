import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import AdminLayout from './layouts/AdminLayout'
import GymAdminLayout from './layouts/GymAdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import UpdatePrompt from './components/UpdatePrompt'
import { ServiceWorkerManager } from './lib/service-worker-register'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Admin from './pages/Admin'
import AdminUsers from './pages/AdminUsers'
import AdminGyms from './pages/AdminGyms'
import AdminPayments from './pages/AdminPayments'
import AdminPlans from './pages/AdminPlans'
import AdminSubscriptions from './pages/AdminSubscriptions'
import AdminSettings from './pages/AdminSettings'
import AdminRegisterGym from './pages/AdminRegisterGym'
import GymAdminGymPanel from './pages/GymAdminGymPanel'
import GymAdminOrders from './pages/GymAdminOrders'
import GymAdminOverview from './pages/GymAdminOverview'
import GymAdminPayments from './pages/GymAdminPayments'
import GymAdminProducts from './pages/GymAdminProducts'
import GymAdminSubscriptions from './pages/GymAdminSubscriptions'
import GymAdminUsers from './pages/GymAdminUsers'

const App = () => {
  useEffect(() => {
    // Registrar Service Worker
    ServiceWorkerManager.register()
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/superadmin"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Admin />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="gyms" element={<AdminGyms />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="register-gym" element={<AdminRegisterGym />} />
        </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="gym_admin">
            <GymAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GymAdminOverview />} />
        <Route path="users" element={<GymAdminUsers />} />
        <Route path="gym" element={<GymAdminGymPanel />} />
        <Route path="subscriptions" element={<GymAdminSubscriptions />} />
        <Route path="products" element={<GymAdminProducts />} />
        <Route path="orders" element={<GymAdminOrders />} />
        <Route path="payments" element={<GymAdminPayments />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    {/* PWA Update Prompt */}
    <UpdatePrompt />
    </>
  )
}

export default App
