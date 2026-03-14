import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Card from '../components/Card'
import { supabase } from '../lib/supabase'

type ProfileRow = {
  id?: string
  full_name?: string
  email?: string
  role?: string
  gym?: string
  plan_name?: string
  plan_price?: number | string
  status?: string
  updated_at?: string
  created_at?: string
}

const AdminUsers = () => {
  const [users, setUsers] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'gym_owner')
        .order('created_at', { ascending: false })

      if (!active) return
      if (err) {
        setError(err.message)
        setUsers([])
      } else {
        setUsers(data ?? [])
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const formatPrice = (value?: number | string) => {
    if (value === undefined || value === null) return 'N/D'
    if (typeof value === 'number') return `$${value.toFixed(2)}`
    return String(value)
  }

  const formatDate = (value?: string) => {
    if (!value) return '—'
    const date = new Date(value)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-secondary">Admins de gimnasio</p>
        <h1 className="text-2xl font-bold">Relación admin ↔ gimnasio ↔ plan</h1>
      </div>

      <Card subtitle="Admins creados desde Supabase (rol gym_owner)">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="animate-spin" size={16} /> Cargando admins
          </div>
        ) : error ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{error}</div>
        ) : users.length === 0 ? (
          <p className="text-sm text-text-secondary">Sin admins de gimnasio creados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-text-secondary">
                <tr>
                  <th className="py-2">Admin</th>
                  <th className="py-2">Correo</th>
                  <th className="py-2">Gimnasio</th>
                  <th className="py-2">Plan</th>
                  <th className="py-2">Precio</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id ?? user.email ?? Math.random().toString()}>
                    <td className="py-3 font-semibold text-text">{user.full_name ?? 'Sin nombre'}</td>
                    <td className="py-3">{user.email ?? 'Sin correo'}</td>
                    <td className="py-3">{user.gym ?? 'N/D'}</td>
                    <td className="py-3">{user.plan_name ?? 'N/D'}</td>
                    <td className="py-3">{formatPrice(user.plan_price)}</td>
                    <td className="py-3">
                      <span className={`pill text-xs ${user.status === 'Activo' ? 'bg-success/15 text-success border-success/30' : user.status === 'Trial' ? 'bg-info/15 text-info border-info/30' : 'bg-text-secondary/10 text-text border-border'}`}>
                        {user.status ?? 'Sin estado'}
                      </span>
                    </td>
                    <td className="py-3 text-text-secondary">{formatDate(user.updated_at ?? user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminUsers
