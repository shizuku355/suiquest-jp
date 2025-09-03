export interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  startMs: number;
  endMs: number;
  cap: number;
  minted: number;
  admin: string;
}

export interface PassNFT {
  id: string;
  eventId: string;
  eventName: string;
  eventSlug: string;
  imageUrl: string;
  mintedAt: number;
  holder: string;
}

// Mock data - now empty (use actual on-chain data)
export const mockEvents: Event[] = [];