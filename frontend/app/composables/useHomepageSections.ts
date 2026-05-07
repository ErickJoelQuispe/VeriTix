export interface HomepageSectionLink {
  id: string
  label: string
}

export function useHomepageSections(): HomepageSectionLink[] {
  return [
    { id: 'hero', label: 'Inicio' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'generos', label: 'Generos' },
    { id: 'como-funciona', label: 'Como funciona' },
    { id: 'footer', label: 'Contacto' },
  ]
}
