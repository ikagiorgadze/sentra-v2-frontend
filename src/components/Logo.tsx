import { cn } from "@/lib/utils";

interface LogoProps {
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo = ({ showWordmark = true, size = "md", className }: LogoProps) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Nine-dot grid symbol */}
      <div className={cn("grid grid-cols-3 gap-[2px]", sizes[size])}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-full bg-signal-cyan rounded-[1px]"
            style={{
              opacity: i === 4 ? 1 : 0.6,
            }}
          />
        ))}
      </div>
      
      {showWordmark && (
        <span className={cn(
          "font-sans font-bold tracking-[0.2em] uppercase",
          textSizes[size]
        )}>
          SENTRA
        </span>
      )}
    </div>
  );
};
