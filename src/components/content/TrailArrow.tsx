// Flecha de señal de sendero: placa con punta, no un chevron (DESIGN.md §3.5).
// Se desplaza 2 px cuando el enlace contenedor (`group`) recibe hover o foco.
export function TrailArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 22 12"
      width="22"
      height="12"
      aria-hidden="true"
      className={`inline-block shrink-0 fill-accent transition-transform duration-150 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 ${className}`}
    >
      <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H16l6 6-6 6H1.5A1.5 1.5 0 0 1 0 10.5z" />
    </svg>
  )
}
