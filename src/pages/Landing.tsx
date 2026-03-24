import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ShoppingBag, Sparkles, Users } from 'lucide-react'


const Landing = () => {
  const coreFeatures = [
    {
      title: 'Suscripciones bajo control',
      description: 'Gestiona planes, renovaciones y estado de cada miembro sin hojas de calculo.',
      icon: CheckCircle2,
    },
    {
      title: 'Operacion mas simple para tu equipo',
      description: 'Usuarios, pagos y seguimiento diario en un panel claro para recepcion y administracion.',
      icon: Users,
    },
    {
      title: 'Productos en linea para tus clientes',
      description: 'Publica suplementos y articulos del gimnasio para compra online desde el mismo sistema.',
      icon: ShoppingBag,
    },
  ]

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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffb39f] via-[#ff8f7d] to-[#e24553] text-[#1b0c0f] shadow-[0_10px_24px_rgba(255,143,125,0.35)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black uppercase tracking-[0.12em] text-[#ffd2c9]">FITCONNECT</p>
              <p className="text-xs text-white/70">Sistema de gestion para gimnasios</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">

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
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ffbcae]">FITCONNECT</p>
              <h1 className="text-4xl font-black leading-tight md:text-5xl">
                Gestiona suscripciones y ventas de tu gimnasio en un solo lugar
              </h1>
              <p className="text-lg text-white/75">
                FitConnect te ayuda a organizar membresias, cobros y productos con una experiencia simple,
                cercana y pensada para que tu equipo trabaje mas tranquilo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#e24553] via-[#ff5f5f] to-[#ff8f7d] px-6 py-3 text-sm font-semibold text-[#1b0c0f] shadow-[0_15px_40px_rgba(226,69,83,0.28)] transition hover:-translate-y-0.5"
              >
                Comenzar ahora
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="relative" aria-labelledby="beneficios">
            <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-[#e24553]/25 blur-3xl" aria-hidden />
            <div className="absolute -right-12 bottom-8 h-28 w-28 rounded-full bg-[#ff8f7d]/20 blur-3xl" aria-hidden />
            <div className="relative rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur-xl md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffbcae]">FITCONNECT</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#ffc6bc]">Lo que puedes hacer con la plataforma</p>
              <div className="mt-5 space-y-4" id="beneficios">
                {coreFeatures.map((feature) => {
                  const Icon = feature.icon

                  return (
                    <article
                      key={feature.title}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#ff9f8d]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-white">{feature.title}</h2>
                          <p className="mt-1 text-sm text-white/70">{feature.description}</p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </main>

        <section className="mt-14 rounded-3xl border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-white/10 p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#ffc6bc]">Una experiencia mas completa</p>
              <h2 className="mt-3 text-2xl font-black leading-tight md:text-3xl">
                De la suscripcion mensual a la compra online, todo queda conectado
              </h2>
              <p className="mt-3 text-white/75">
                Tus clientes pueden mantener su membresia activa y tambien comprar productos del gimnasio sin salir
                del ecosistema. Menos friccion para ellos, mas orden para tu equipo.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <ul className="space-y-3 text-sm text-white/85">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#ff8f7d]" />
                  <span>Planes y renovaciones visibles en tiempo real.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#ff8f7d]" />
                  <span>Catalogo de productos listo para vender en linea.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#ff8f7d]" />
                  <span>Informacion centralizada para decisiones mas rapidas.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>


      </div>
    </div>
  )
}

export default Landing
