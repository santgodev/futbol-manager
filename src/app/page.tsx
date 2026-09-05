import { Header } from "@/components/layout/Header";
import { HomeHero } from "@/components/home/HomeHero";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { HomeFooter } from "@/components/home/HomeFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E213A] via-[#D8DEE9] to-[#F4F6F9] text-slate-800 font-sans selection:bg-[#0a84ff] selection:text-white relative">
      <Header />
      
      <HomeHero />
      
      <main className="w-full">
        <DashboardGrid />
      </main>

      <HomeFooter />
    </div>
  );
}
