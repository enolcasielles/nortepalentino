// Símbolo: tres cumbres anidadas, como curvas de nivel de un perfil de sierra.
// Provisional hasta cerrar el logotipo (DESIGN.md §9).
export function LogoSymbol({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M2.5 26.5 11 11.5l3.5 4.5L20 5.5l9.5 21" />
      <path d="M8 26.5l4-6.5 3 3.5L20 13l6 13.5" />
      <path d="M14 26.5l5.5-6.5 3.5 6.5" />
    </svg>
  )
}

// Versión horizontal: placa con el símbolo + wordmark (DESIGN.md §3.6)
export function Wordmark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid size-9 place-items-center rounded-md ${inverted ? 'bg-white text-primary' : 'bg-primary text-primary-contrast'}`}
      >
        <LogoSymbol className="size-6" />
      </span>
      <span
        className={`font-display text-lg font-extrabold tracking-[-0.03em] whitespace-nowrap lowercase sm:text-xl ${inverted ? 'text-white' : 'text-ink'}`}
      >
        norte palentino
      </span>
    </span>
  )
}
