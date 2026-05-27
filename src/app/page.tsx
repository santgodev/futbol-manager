import { Header } from "@/components/layout/Header";
import { HomeHero } from "@/components/home/HomeHero";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { HomeFooter } from "@/components/home/HomeFooter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-deep text-brand-text font-sans selection:bg-brand-blue selection:text-white relative">
      <Header />
      
      <HomeHero />
      
      <main className="w-full">
        <DashboardGrid />
      </main>

      <HomeFooter />
    </div>
  );
}
