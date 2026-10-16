export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#contenido"
      className="sr-only rounded-md bg-primary px-4 py-3 text-primary-contrast focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
    >
      {label}
    </a>
  )
}
