import { Header } from "@/components/layout/Header";
import { PromoUniforms } from "@/components/home/PromoUniforms";
import { HomeFooter } from "@/components/home/HomeFooter";

export const metadata = {
  title: 'Uniformes Exclusivos | Arena SaaS',
  description: 'Lleva a tu equipo al siguiente nivel con nuestra nueva línea de uniformes de élite.',
};

export default function UniformesPage() {
  return (
    <div className="min-h-screen bg-brand-deep text-brand-text font-sans selection:bg-brand-blue selection:text-white flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center">
        {/* Usamos el componente que ya creamos, pero como página dedicada */}
        <PromoUniforms />
      </main>

      <HomeFooter />
    </div>
  );
}
