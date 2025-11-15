import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-off-white dark:bg-graphite relative overflow-hidden">
      {/* Nine-dot watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
        <div className="grid grid-cols-3 gap-4 w-96 h-96">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-full bg-signal-cyan rounded-sm"
              style={{ opacity: i === 4 ? 1 : 0.6 }}
            />
          ))}
        </div>
      </div>

      <div className="text-center space-y-6 relative z-10 max-w-2xl px-8">
        <h1 className="text-6xl font-bold uppercase tracking-tight">404 — Page Not Found</h1>
        <p className="text-xl text-muted-foreground">
          The requested page does not exist or is no longer available.
        </p>
        <p className="text-base text-muted-foreground">
          No action is required. Use the navigation to return to the main interface or proceed to the dashboard.
        </p>
        <p className="text-xs text-muted-foreground font-mono pt-4">
          The system registered an invalid path. No data was affected.
        </p>
        
        <div className="pt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-signal-cyan text-signal-cyan hover:bg-signal-cyan hover:text-charcoal shadow-none hover:shadow-glow-cyan transition-all"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
