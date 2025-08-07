export const Line = ({
  color,
  width = "100%",
  height = "1px",
  vertical = false,
  className = "",
}: {
  color?: string;
  width?: string;
  height?: string;
  vertical?: boolean;
  className?: string;
}) => {
  // Helper: convert hex to rgb string for use in style
  const hexToRgb = (hex: string) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
  };

  // Handles both CSS variable and hex color
  const getStopColor = (color?: string) => {
    if (!color) return "#6104C0";
    if (color.startsWith("var(")) return color;
    if (color.startsWith("#")) return color;
    return color;
  };

  if (vertical) {
    const viewBoxHeight =
      typeof height === "string" && height.endsWith("%") ? 100 : parseInt(height as string, 10) || 80;
    return (
      <svg
        className={className}
        width={width}
        height={height}
        viewBox={`0 0 1 ${viewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="0.5" y1="0" x2="0.5" y2={viewBoxHeight} stroke="url(#paint0_linear_v)" />
        <defs>
          <linearGradient
            id="paint0_linear_v"
            x1="1"
            y1="0"
            x2="1"
            y2={viewBoxHeight}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F5F5F5" stopOpacity="0.7" />
            <stop offset="0.5" stopColor={getStopColor(color)} />
            <stop offset="1" stopColor="#F5F5F5" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Default horizontal

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 322 1"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line y1="0.5" x2="322" y2="0.5" stroke="url(#paint0_linear_3063_166)" />
      <defs>
        <linearGradient
          id="paint0_linear_3063_166"
          x1="0"
          y1="1"
          x2="322"
          y2="1.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5F5F5" stopOpacity="0.7" />
          <stop offset="0.5" stopColor={getStopColor(color)} />
          <stop offset="1" stopColor="#F5F5F5" stopOpacity="0.7" />
        </linearGradient>
      </defs>
    </svg>
  );
};


export const GradientLine = ({
  color = "#6104C0",
  width = "100%",
  height = "2px",
  className = "",
  style = {},
}: {
  color?: string;
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={className}
    style={{
      width,
      height,
      borderRadius: height,
      background: `linear-gradient(90deg, var(--line-side) 0%, ${color} 50%, var(--line-side) 100%)`,
      ...style,
    }}
  />
);


export const GradientLineVertical = ({
  color = "#6104C0",
  width = "2px",
  height = "100%",
  className = "",
  style = {},
}: {
  color?: string;
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={className}
    style={{
      width,
      height,
      borderRadius: width,
      background: `linear-gradient(180deg, var(--line-side) 0%, ${color} 50%, var(--line-side) 100%)`,
      ...style,
    }}
  />
);