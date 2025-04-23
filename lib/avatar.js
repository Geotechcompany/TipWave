/**
 * Utility functions for user avatar generation
 */

/**
 * Generate a default profile picture URL using UI Avatars service
 * @param {string} name - User's full name
 * @param {string} email - User's email (used as fallback if name is not provided)
 * @returns {string} URL to the generated avatar
 */
export function generateDefaultAvatar({ name, email }) {
  // Use name, or extract name from email if not available
  const displayName = name || email?.split('@')[0] || 'User';
  
  // Generate avatar URL using UI Avatars service
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=200&bold=true`;
}

/**
 * Generate a local SVG avatar based on user initials
 * @param {string} name - User's full name 
 * @param {string} email - User's email (used as fallback if name is not provided)
 * @returns {string} SVG data URL for the avatar
 */
export function generateLocalAvatar({ name, email }) {
  // Use name, or extract name from email if not available
  const displayName = name || email?.split('@')[0] || 'User';
  
  // Get initials (up to 2 characters)
  const initials = displayName
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  // Generate a random but consistent color based on the name
  const colors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', 
    '#6366F1', '#EF4444', '#06B6D4', '#F97316', '#8B5CF6'
  ];
  
  // Simple hash function to get consistent color for same name
  const hash = displayName.split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const backgroundColor = colors[hash % colors.length];
  
  // Create SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${backgroundColor}" />
      <text x="100" y="115" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
    </svg>
  `;
  
  // Convert to data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
} 