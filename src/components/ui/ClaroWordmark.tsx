'use client';

interface Props {
  color?: string;
  className?: string;
}

/** SVG wordmark "claro" — usado quando precisa de cor dinâmica (loading, headers) */
export function ClaroWordmark({ color = '#D52B1E', className }: Props) {
  return (
    <svg viewBox="0 0 480 160" className={className} xmlns="http://www.w3.org/2000/svg">
      <text
        x="240"
        y="118"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="138"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="-4"
        fill={color}
      >
        claro
      </text>
    </svg>
  );
}
