export const MuffinLogo = ({ width = 32, height = 32 }: { width?: number; height?: number }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Muffin wrapper */}
    <path
      d="M12 32C12 32 16 48 32 48C48 48 52 32 52 32"
      stroke="#995C2E"
      strokeWidth="4"
      fill="#C17F59"
    />
    {/* Muffin top */}
    <path
      d="M8 32C8 22 18 14 32 14C46 14 56 22 56 32"
      fill="#8B4513"
      stroke="#733A1A"
      strokeWidth="4"
    />
    {/* Chocolate chips */}
    <circle cx="24" cy="22" r="2" fill="#40240A" />
    <circle cx="36" cy="20" r="2" fill="#40240A" />
    <circle cx="30" cy="26" r="2" fill="#40240A" />
    <circle cx="42" cy="24" r="2" fill="#40240A" />
    {/* Energy bolt */}
    <path
      d="M38 14L26 26L34 28L28 38L40 26L32 24L38 14Z"
      fill="#FFD700"
      stroke="#FFA500"
      strokeWidth="2"
    />
  </svg>
); 