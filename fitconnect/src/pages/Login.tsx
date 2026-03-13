import { type FormEvent, useState } from 'react'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isValidEmail } from '../lib/validators'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError('')

    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmail(normalizedEmail)) {
      setLoginError('Ingresa un correo electrónico válido')
      return
    }

    if (!password.trim()) {
      setLoginError('La contraseña es obligatoria')
      return
    }

    setLoginLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password.trim(),
    })

    setLoginLoading(false)

    if (error) {
      setLoginError(error.message)
      return
    }

    // Obtiene el rol desde las tablas de administradores
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    if (!userId) {
      setLoginError('No se pudo obtener información del usuario')
      return
    }

    // Verificar el rol del usuario en la tabla administrators
    const { data: admin, error: adminError } = await supabase
      .from('administrators')
      .select('id, role')
      .eq('user_id', userId)
      .maybeSingle()

    console.log('Checking admin for user:', userId)
    console.log('admin result:', admin)
    console.log('adminError:', adminError)

    if (adminError) {
      console.error('Error checking admin:', adminError)
      setLoginError('Error al obtener información del usuario')
      return
    }

    if (!admin) {
      setLoginError('Usuario no registrado como administrador')
      return
    }

    console.log('Admin role:', admin.role)

    if (admin.role === 'superadmin') {
      console.log('Usuario ES superadmin, redirigiendo a /superadmin')
      navigate('/superadmin')
      return
    }

    if (admin.role === 'gym_admin') {
      console.log('Usuario ES gym_admin, redirigiendo a /admin')
      navigate('/admin')
      return
    }

    console.log('Usuario tiene rol desconocido:', admin.role)
    setLoginError('Rol de usuario no reconocido')
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0d0a12] via-[#1a0c17] to-[#23101c] text-white flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(226,69,83,0.18), transparent 35%), radial-gradient(circle at 80% 10%, rgba(226,69,83,0.22), transparent 30%), radial-gradient(circle at 20% 80%, rgba(255,116,92,0.16), transparent 30%)',
        }}
      />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#e24553]/25 blur-3xl" />
      <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[#ff745c]/25 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur space-y-5">
        <div className="space-y-1 text-center">
          <p className="text-sm uppercase tracking-wide text-white/70">Acceso</p>
          <p className="text-xl font-bold">Inicia sesión</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm font-semibold text-white/80" htmlFor="email">
            Correo
            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-[#ff745c]/60 focus-within:bg-white/10">
              <Mail size={18} className="text-white/60" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="admin@fitconnect.com"
                className="w-full bg-transparent text-white placeholder:text-white/40 outline-none"
              />
            </div>
          </label>

          <label className="space-y-2 text-sm font-semibold text-white/80" htmlFor="password">
            Contraseña
            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-[#ff745c]/60 focus-within:bg-white/10">
              <Lock size={18} className="text-white/60" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-transparent text-white placeholder:text-white/40 outline-none"
              />
            </div>
          </label>

          <div className="flex items-center justify-between text-sm text-white/70">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-white/30 bg-transparent text-primary focus:ring-primary/60"
              />
              Recuérdame
            </label>
            <button type="button" className="font-semibold text-[#ff8f7d] hover:text-white transition-colors">
              ¿Olvidaste tu clave?
            </button>
          </div>

          {loginError && <p className="text-sm font-semibold text-[#ffb3a5]">{loginError}</p>}

          <button
            type="submit"
            disabled={loginLoading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#e24553] via-[#ff5f5f] to-[#ff8f7d] px-4 py-3 text-sm font-semibold text-background shadow-soft transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loginLoading ? 'Entrando…' : 'Entrar'}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
