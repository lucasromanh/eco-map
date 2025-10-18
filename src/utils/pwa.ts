// Detecta si la app está corriendo como PWA instalada
export function isRunningStandalone() {
  // Para la mayoría de navegadores
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // Para iOS
  if ((window.navigator as any).standalone) return true;
  return false;
}
