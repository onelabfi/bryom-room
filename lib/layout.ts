/**
 * Which paths render in portrait vs landscape inside the phone frame.
 * The entry ("How are you feeling?") is portrait — user is usually
 * still holding the phone normally. All room/game views are landscape.
 */
export const PORTRAIT_PATHS = ["/"];

export function isPortraitPath(pathname: string): boolean {
  return PORTRAIT_PATHS.includes(pathname);
}

export function isLandscapePath(pathname: string): boolean {
  return pathname.startsWith("/room");
}
