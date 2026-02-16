import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap } from "lucide-react";

const skillCategories = [
  { category: "Frontend", skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "HTML/CSS"] },
  { category: "Backend", skills: ["Node.js", "Python", "PostgreSQL", "REST APIs", "GraphQL"] },
  { category: "Tools & Other", skills: ["Git", "Docker", "AWS", "Figma", "Agile"] },
];

const experiences = [
  { role: "Senior Developer", company: "Tech Corp", period: "2022 – Present", type: "work" as const },
  { role: "Full Stack Developer", company: "StartupXYZ", period: "2020 – 2022", type: "work" as const },
  { role: "B.Sc. Computer Science", company: "University", period: "2016 – 2020", type: "education" as const },
];

const SkillsSection = () => {
  return (
    <section id="skills" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-2">Skills & Experience</h2>
          <p className="text-muted-foreground mb-12 max-w-lg">Technologies I work with and my professional journey.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">Technical Skills</h3>
            <div className="space-y-6">
              {skillCategories.map((cat) => (
                <div key={cat.category}>
                  <p className="text-sm text-primary font-medium mb-3">{cat.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="py-1.5 px-3">{skill}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">Experience</h3>
            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="mt-1 p-2 rounded-lg bg-secondary border border-border">
                    {exp.type === "work" ? <Briefcase size={16} className="text-primary" /> : <GraduationCap size={16} className="text-primary" />}
                  </div>
                  <div>
                    <h4 className="text-foreground font-medium">{exp.role}</h4>
                    <p className="text-muted-foreground text-sm">{exp.company}</p>
                    <p className="text-muted-foreground text-xs mt-1">{exp.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
