import { notFound } from "next/navigation";
import type { Metadata } from 'next';

// Import the new client component
import PayClientComponent from './PayClientComponent';

// --- Location Data Interface ---
interface Location {
  id: string;
  name: string;
  price: number;
  logoUrl?: string;
}

// --- Location Data (Keep in Server Component scope) ---
const locations: Location[] = [
  { id: "Katraj", name: "Katraj", price: 100, logoUrl: "/logos/katraj-logo.png" },
  { id: "Dhankawadi", name: "Dhankawadi", price: 150, logoUrl: "/logos/dhankawadi-logo.png" },
  // Add more locations here
];

// Function to find location (can be reused by generateMetadata and Page)
function getLocationById(locationId: string): Location | undefined {
  return locations.find(loc => loc.id.toLowerCase() === locationId?.toLowerCase());
}

// --- Generate Metadata (Server-side) ---
export async function generateMetadata(
  { params }: { params: { locationId: string } }
): Promise<Metadata> {
  const currentLocation = getLocationById(params.locationId);

  if (!currentLocation) {
    return {
      title: "Location Not Found",
    };
  }

  return {
    title: `Pay at ${currentLocation.name}`,
  };
}

// --- Page Component (Server Component) ---
interface PageProps {
  params: { locationId: string };
}

export default function Page({ params }: PageProps) {
  const currentLocation = getLocationById(params.locationId);

  // Handle not found case on the server
  if (!currentLocation) {
    notFound();
  }

  // Render the Client Component, passing the found location data
  return <PayClientComponent location={currentLocation} />;
} 