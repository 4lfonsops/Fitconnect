import clsx from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

const Card = ({ title, subtitle, action, children, className }: CardProps) => {
  return (
    <section className={clsx('card-panel', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            {title && <h3 className="text-lg font-bold text-text">{title}</h3>}
            {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export default Card
