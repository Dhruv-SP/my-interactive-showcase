import { useRef, useState, useCallback } from 'react';
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import BlogSection from "@/components/sections/BlogSection";
import CertificatesSection from "@/components/sections/CertificatesSection";
import ContactSection from "@/components/sections/ContactSection";
import { BackgroundCanvas } from "@/components/BackgroundCanvas";
import { useSectionTheme } from "@/hooks/useSectionTheme";
import type { SectionId } from "@/background/types";

const Index = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('hero');

  const heroRef         = useRef<HTMLDivElement>(null);
  const certificatesRef = useRef<HTMLDivElement>(null);
  const projectsRef     = useRef<HTMLDivElement>(null);
  const skillsRef       = useRef<HTMLDivElement>(null);
  const blogRef         = useRef<HTMLDivElement>(null);
  const contactRef      = useRef<HTMLDivElement>(null);

  const handleSectionChange = useCallback((section: SectionId) => {
    setActiveSection(section);
  }, []);

  useSectionTheme(
    {
      hero:         heroRef,
      certificates: certificatesRef,
      projects:     projectsRef,
      skills:       skillsRef,
      blog:         blogRef,
      contact:      contactRef,
    },
    handleSectionChange,
  );

  return (
    <div className="min-h-screen bg-background">
      <BackgroundCanvas
          activeSection={activeSection}
          sectionRefs={{
            hero:         heroRef,
            certificates: certificatesRef,
            projects:     projectsRef,
            skills:       skillsRef,
            blog:         blogRef,
            contact:      contactRef,
          }}
        />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <div ref={heroRef}         style={{ backgroundColor: '#14455231' }}><HeroSection /></div>
        <div ref={certificatesRef} style={{ backgroundColor: '#14455231' }}><CertificatesSection /></div>
        <div ref={projectsRef}     style={{ backgroundColor: '#14455231' }}><ProjectsSection /></div>
        <div ref={skillsRef}       style={{ backgroundColor: '#14455231' }}><SkillsSection /></div>
        <div ref={blogRef}         style={{ backgroundColor: '#14455231' }}><BlogSection /></div>
        <div ref={contactRef}      style={{ backgroundColor: '#14455231' }}><ContactSection /></div>
      </main>
    </div>
  );
};

export default Index;
