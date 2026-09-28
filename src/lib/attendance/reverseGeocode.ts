/**
 * Reverse Geocoding Utility
 * Converts latitude and longitude coordinates into human-readable location and address names
 * with automatic caching and multiple high-availability provider fallbacks.
 */

const locationCache = new Map<string, string>();

export async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<string> {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return '';

  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey)!;
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(`geo_addr_${cacheKey}`);
    if (cached) {
      locationCache.set(cacheKey, cached);
      return cached;
    }
  } catch {}

  let formattedLocation = '';

  // 1. Primary Provider: BigDataCloud Reverse Geocoding (Fast, client-side, CORS friendly)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      const parts: string[] = [];
      
      if (data.locality) parts.push(data.locality);
      else if (data.city) parts.push(data.city);
      else if (data.principalSubdivision) parts.push(data.principalSubdivision);

      if (data.city && !parts.includes(data.city)) parts.push(data.city);
      if (data.principalSubdivision && !parts.includes(data.principalSubdivision)) parts.push(data.principalSubdivision);
      if (data.postcode) parts.push(data.postcode);

      if (parts.length > 0) {
        formattedLocation = parts.join(', ');
      }
    }
  } catch (e) {
    // Fallback to OSM Nominatim
  }

  // 2. Secondary Provider: OpenStreetMap Nominatim
  if (!formattedLocation) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'en' },
          signal: AbortSignal.timeout(4000)
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const parts: string[] = [];

        const localArea = addr.suburb || addr.neighbourhood || addr.road || addr.amenity || addr.residential;
        if (localArea) parts.push(localArea);

        const city = addr.city || addr.town || addr.village || addr.county;
        if (city && !parts.includes(city)) parts.push(city);

        const state = addr.state;
        if (state && !parts.includes(state)) parts.push(state);

        if (addr.postcode) parts.push(addr.postcode);

        if (parts.length > 0) {
          formattedLocation = parts.join(', ');
        } else if (data.display_name) {
          formattedLocation = data.display_name.split(',').slice(0, 3).join(',').trim();
        }
      }
    } catch (e) {}
  }

  // 3. Fallback: Compact coordinate string if network/offline
  if (!formattedLocation) {
    formattedLocation = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  // Cache formatted result
  locationCache.set(cacheKey, formattedLocation);
  try {
    localStorage.setItem(`geo_addr_${cacheKey}`, formattedLocation);
  } catch {}

  return formattedLocation;
}
