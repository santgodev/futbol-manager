import { Header } from "@/components/layout/Header";
import { HomeHero } from "@/components/home/HomeHero";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { HomeFooter } from "@/components/home/HomeFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#05080b] text-[#f7f9fb] font-sans selection:bg-[#0a84ff] selection:text-white relative">
      <Header />
      
      <HomeHero />
      
      <main className="w-full">
        <DashboardGrid />
      </main>

      <HomeFooter />
    </div>
  );
}
