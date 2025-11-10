import React, { useId, useState, ReactNode } from 'react'
import { m } from 'framer-motion'

type Placement = 'right' | 'top' | 'bottom' | 'left'

type Props = {
  children: ReactNode
  content: ReactNode
  placement?: Placement
  className?: string
}

/**
 * Accessible Tooltip
 * - shows on hover/focus
 * - provides aria-describedby for screen readers
 * - simple placement support (right/top/bottom/left)
 */
export const Tooltip: React.FC<Props> = ({ children, content, placement = 'right', className = '' }) => {
  const id = useId()
  const [open, setOpen] = useState(false)

  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  const posClass =
    placement === 'right'
      ? 'left-full ml-3 top-1/2 -translate-y-1/2'
      : placement === 'left'
      ? 'right-full mr-3 top-1/2 -translate-y-1/2'
      : placement === 'top'
      ? 'bottom-full mb-3 left-1/2 -translate-x-1/2'
      : 'top-full mt-3 left-1/2 -translate-x-1/2'

  return (
    <span className={`relative inline-flex ${className}`} onMouseEnter={show} onMouseLeave={hide}>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement, {
            // Cast to any to allow hyphenated ARIA attribute and event handlers without TS overload issues
            ...( {
              'aria-describedby': id,
              onFocus: show,
              onBlur: hide,
              onMouseEnter: show,
              onMouseLeave: hide,
            } as any ),
          })
        : children}

      <m.span
        id={id}
        role="tooltip"
        aria-hidden={!open}
        initial={{ opacity: 0, y: -4 }}
        animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
        transition={{ duration: 0.14 }}
        className={`pointer-events-none absolute z-50 ${posClass} whitespace-nowrap rounded px-3 py-1 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow`}
      >
        {content}
      </m.span>
    </span>
  )
}

export default Tooltip