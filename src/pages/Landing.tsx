import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from 'lucide-react'

const features = [
  {
    title: 'Operación ordenada',
    description: 'Usuarios, membresías y sedes en un solo lugar.',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    title: 'Accesos claros',
    description: 'Roles y auditoría sin pasos extras ni ruido.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Reportes listos',
    description: 'Descarga lo esencial para el equipo en segundos.',
    icon: <Sparkles className="h-5 w-5" />,
  },
]

const Landing = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0d0a12] via-[#1a0c17] to-[#23101c] text-white">
      <div className="absolute inset-0 opacity-[0.55]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(226,69,83,0.28), transparent 32%), radial-gradient(circle at 80% 10%, rgba(255,116,92,0.22), transparent 30%), radial-gradient(circle at 65% 70%, rgba(255,143,125,0.2), transparent 30%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8 md:px-12 md:py-10">
        <header className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#ff8f7d]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black">FitConnect</p>
              <p className="text-xs text-white/70">Gestión integral de gimnasios</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a className="hover:text-white" href="#resumen">Resumen</a>
            <a className="hover:text-white" href="#beneficios">Beneficios</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e24553] via-[#ff5f5f] to-[#ff8f7d] px-5 py-2 text-sm font-semibold text-[#0f0a0a] shadow-[0_10px_30px_rgba(226,69,83,0.25)] transition hover:-translate-y-0.5"
            >
              Ir al login
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </header>

        <main className="mt-14 grid items-center gap-12 md:grid-cols-2" id="resumen">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#ffd5cc]">
              <CheckCircle2 className="h-4 w-4" /> Acceso al panel
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black leading-tight md:text-5xl">
                Administra tus gimnasios desde un panel claro y seguro
              </h1>
              <p className="text-lg text-white/75">
                Punto de entrada para equipos admin y superadmin. Todo lo esencial en un solo lugar, sin ruido.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#e24553] via-[#ff5f5f] to-[#ff8f7d] px-6 py-3 text-sm font-semibold text-[#1b0c0f] shadow-[0_15px_40px_rgba(226,69,83,0.28)] transition hover:-translate-y-0.5"
              >
                Entrar al panel
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <a
                href="#beneficios"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/35 hover:bg-white/10"
              >
                Ver beneficios
              </a>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-white/75">
              <span className="pill bg-white/10 border-white/15">Acceso seguro</span>
              <span className="pill bg-white/10 border-white/15">Panel limpio</span>
              <span className="pill bg-white/10 border-white/15">Soporte humano</span>
            </div>
          </div>

          <div className="relative" aria-labelledby="beneficios">
            <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-[#e24553]/25 blur-3xl" aria-hidden />
            <div className="absolute -right-12 bottom-8 h-28 w-28 rounded-full bg-[#ff8f7d]/20 blur-3xl" aria-hidden />

            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#0f1c36]/60 px-5 py-4">
                  <p className="text-sm text-white/70">Vista rápida</p>
                  <p className="text-xl font-bold">Panel listo para entrar</p>
                  <p className="text-xs text-white/60 mt-1">Acceso central para admin y superadmin.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold">Pendientes del día</p>
                    <ul className="mt-2 space-y-2 text-sm text-white/75">
                      <li>• Revisar altas de gimnasios nuevos</li>
                      <li>• Confirmar accesos de equipo interno</li>
                      <li>• Exportar reporte semanal</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold">Accesos rápidos</p>
                    <div className="mt-2 flex flex-col gap-2 text-sm text-white/75">
                      <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                        <ShieldCheck className="h-4 w-4 text-[#ffb3a5]" /> Superadmin / Admin
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                        <Sparkles className="h-4 w-4 text-[#ffb3a5]" /> Reportes y descargas
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-white/80" id="beneficios">
                  {features.map((item) => (
                    <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e24553]/20 text-[#ffb3a5]">
                        {item.icon}
                      </div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-white/65 text-xs">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <section className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-base font-semibold text-white">Panel Superadmin</p>
            <p className="mt-2 text-white/70">Control de altas de gimnasios, equipos internos y configuraciones generales.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-base font-semibold text-white">Panel Admin</p>
            <p className="mt-2 text-white/70">Gestión diaria de usuarios, membresías y reportes rápidos.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-base font-semibold text-white">Soporte y ayuda</p>
            <p className="mt-2 text-white/70">Enlaces útiles, guías cortas y exportes listos para compartir.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Landing
