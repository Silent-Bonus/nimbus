export const getSelfCareIconTint = (color: string) =>
  color.startsWith("#") ? `${color}24` : "rgba(255,255,255,0.08)";

export const getSelfCareTileGradient = (color: string): [string, string] => [
  "rgba(255,255,255,0.02)",
  getSelfCareIconTint(color),
];
