/**
 * The globe registers a click when it sees pointerdown then pointerup inside its container,
 * and markers live inside that container. Stopping these events at the marker keeps a click
 * on it from also counting as a click on the globe behind it.
 */
const EVENTS_HIDDEN_FROM_GLOBE = ['pointerdown', 'pointermove'];

function createMarkerHost() {
  const host = document.createElement('div');
  // The globe's HTML layer ignores pointer events by default; markers need them.
  host.style.pointerEvents = 'auto';
  host.style.transition = 'opacity 200ms ease-out';
  EVENTS_HIDDEN_FROM_GLOBE.forEach((eventType) => host.addEventListener(eventType, (event) => event.stopPropagation()));
  return host;
}

/**
 * Returns a function that gives each marker id one long-lived DOM element. The globe
 * positions the element on the marker; React renders the marker's content into it.
 * @returns {(markerId: string) => HTMLElement}
 */
export function createMarkerHostRegistry() {
  const hosts = new Map();

  return function getMarkerHost(markerId) {
    if (!hosts.has(markerId)) hosts.set(markerId, createMarkerHost());
    return hosts.get(markerId);
  };
}

/**
 * Fades out markers on the far side of the globe. `inert` also takes them out of the tab
 * order and the accessibility tree, so hidden markers can't be focused or announced.
 */
export function setMarkerVisibility(element, isVisible) {
  element.style.opacity = isVisible ? '1' : '0';
  element.style.pointerEvents = isVisible ? 'auto' : 'none';
  element.inert = !isVisible;
}
