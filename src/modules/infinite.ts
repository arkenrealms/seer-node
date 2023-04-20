export async function monitorInfiniteRealms(app) {
  setTimeout(() => monitorInfiniteRealms(app), 10 * 1000)
}
