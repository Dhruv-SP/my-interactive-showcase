import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import BlogSection from "@/components/sections/BlogSection";
import CertificatesSection from "@/components/sections/CertificatesSection";
import ContactSection from "@/components/sections/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CertificatesSection />
        <ProjectsSection />
        <SkillsSection />
        <BlogSection />
        
        <ContactSection />
      </main>
    </div>
  );
};

export default Index;
