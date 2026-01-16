import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary gradient orb */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Secondary subtle orb */}
        <div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Tertiary glow */}
        <div 
          className="absolute top-3/4 left-1/4 w-[300px] h-[300px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(var(--secondary) / 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Hero Title */}
          <div className="space-y-4 animate-fade-in">
            <h1 
              className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-foreground"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Mayéutica
            </h1>
            
            {/* Decorative separator */}
            <div className="flex items-center justify-center gap-3 opacity-40">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
            </div>
          </div>

          {/* Subtitle */}
          <p 
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed animate-fade-in"
            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
          >
            Diálogo socrático interior para transformar creencias desde ACT.
          </p>

          {/* Trust microcopy */}
          <p 
            className="text-sm text-muted-foreground/70 tracking-wide animate-fade-in"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            Privado · Sereno · Sin juicios
          </p>

          {/* CTA Button */}
          <div 
            className="pt-4 animate-fade-in"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <Button
              onClick={() => navigate('/app')}
              size="lg"
              className="relative px-10 py-6 text-lg font-medium rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="relative z-10">Entrar</span>
              {/* Button glow effect */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                }}
              />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="relative z-10 pb-8 px-6">
        <div className="max-w-lg mx-auto text-center">
          <Separator className="mb-6 opacity-20" />
          <p className="text-xs text-muted-foreground/50">
            No sustituye terapia profesional.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
