export function generateSectorColor(sectorName: string, index: number): string {
  const baseColors = [
    "#4AEDB9", // legacisGreen
    "#6104C0", // legacisPurple
    "#8036F2", // legacisBlue
    "#FA2EF3", // legacisPink
    "#E2FFE9", // legacisLightGreen
    "#F1FFFA", // legacisLight
    // Additional colors that complement your palette
    "#9D4EDD", // Purple variant
    "#06FFA5", // Green variant
    "#C77DFF", // Light purple
    "#4CC9F0"  // Light blue
  ];
  
  if (index < baseColors.length) {
    return baseColors[index];
  }
  
  // For additional colors beyond the base palette, generate from your primary colors
  const primaryColors = ["#4AEDB9", "#6104C0", "#8036F2", "#FA2EF3"];
  const baseColor = primaryColors[index % primaryColors.length];
  
  // Generate variations of your primary colors
  const variations = [
    adjustColorBrightness(baseColor, 20),   // Lighter
    adjustColorBrightness(baseColor, -15),  // Darker
    adjustColorBrightness(baseColor, 40),   // Much lighter
    adjustColorBrightness(baseColor, -30)   // Much darker
  ];
  
  return variations[(index - baseColors.length) % variations.length];
}


function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
