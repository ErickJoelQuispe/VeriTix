export function useSectionScroll() {
  function scrollToSection(id: string) {
    if (!import.meta.client) {
      return
    }

    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return {
    scrollToSection,
  }
}
