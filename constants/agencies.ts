export type BookingAgency = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  startingPrice: number;
  color: string;
  description: string;
};

export const agencies: BookingAgency[] = [
  {
    id: "general-express",
    name: "General Express",
    initials: "GE",
    rating: 4.6,
    startingPrice: 3600,
    color: "#2563eb",
    description: "Reliable intercity travel with solid comfort.",
  },
  {
    id: "finexs",
    name: "Finexs",
    initials: "FX",
    rating: 4.4,
    startingPrice: 3400,
    color: "#0f766e",
    description: "Fast service specialized on Douala–Yaoundé.",
  },
  {
    id: "vatican-express",
    name: "Vatican Express",
    initials: "VE",
    rating: 4.8,
    startingPrice: 4900,
    color: "#7c3aed",
    description: "Premium coach travel with extra comfort.",
  },
  {
    id: "touristique-express",
    name: "Touristique Express",
    initials: "TE",
    rating: 4.2,
    startingPrice: 3200,
    color: "#ea580c",
    description: "Budget friendly express service.",
  },
  {
    id: "buca-voyages",
    name: "Buca Voyages",
    initials: "BV",
    rating: 4.3,
    startingPrice: 3300,
    color: "#0284c7",
    description: "Regional coverage with dependable schedules.",
  },
  {
    id: "mens-travel",
    name: "Mens Travel",
    initials: "MT",
    rating: 4.7,
    startingPrice: 4700,
    color: "#0ea5e9",
    description: "Comfortable premium travel for business users.",
  },
  {
    id: "global-voyage",
    name: "Global Voyage",
    initials: "GV",
    rating: 4.1,
    startingPrice: 3500,
    color: "#14b8a6",
    description: "Friendly regional routes with good value.",
  },
  {
    id: "blue-bird",
    name: "Blue Bird",
    initials: "BB",
    rating: 4.0,
    startingPrice: 3100,
    color: "#0ea5e9",
    description: "Budget option for smart travelers.",
  },
];

/**
 * Returns a deterministic subset of agencies available for a given route.
 * The from/to order is normalised so Douala→Bamenda === Bamenda→Douala.
 * Result is always 3–5 agencies, consistent for the same route.
 */
export function getAgenciesForRoute(from: string, to: string): BookingAgency[] {
  // Normalise route key (alphabetical order so reverse routes match)
  const routeKey = [from, to].sort().join("|").toLowerCase();

  // Simple hash of the route string
  let hash = 0;
  for (let i = 0; i < routeKey.length; i++) {
    hash = (hash * 31 + routeKey.charCodeAt(i)) >>> 0;
  }

  // Pick how many agencies (3, 4, or 5)
  const count = 3 + (hash % 3); // 3, 4, or 5

  // Shuffle agency indices deterministically using hash
  const indices = agencies.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const seed = (hash * (i + 1) * 2654435761) >>> 0;
    const j = seed % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, count).map((i) => agencies[i]);
}

