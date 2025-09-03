// Admin addresses who can access admin page
export const ADMIN_ADDRESSES = [
  '0xf6bbc8c15562d77d88b4693974513799b49b7a05c26cc57dd348904f7d155fac', // zealous-garnet
];

// Check if an address is an admin
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false;
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}