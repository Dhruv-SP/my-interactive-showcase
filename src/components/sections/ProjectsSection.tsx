import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const placeholderProjects = [
  { id: 1, title: "Project Alpha", description: "A web application that streamlines workflow management for distributed teams.", tags: ["React", "TypeScript", "Tailwind"], link: "#" },
  { id: 2, title: "Project Beta", description: "Mobile-first e-commerce platform with real-time inventory tracking.", tags: ["Next.js", "Supabase", "Stripe"], link: "#" },
  { id: 3, title: "Project Gamma", description: "Data visualization dashboard for monitoring key business metrics.", tags: ["D3.js", "Python", "PostgreSQL"], link: "#" },
  { id: 4, title: "Project Delta", description: "AI-powered content management system with smart categorization.", tags: ["AI/ML", "Node.js", "AWS"], link: "#" },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-2">Projects</h2>
          <p className="text-muted-foreground mb-12 max-w-lg">A selection of work that I'm proud of.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {placeholderProjects.map((project, i) => (
            <motion.a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className="h-40 bg-secondary rounded-lg mb-5 flex items-center justify-center">
                <span className="text-muted-foreground text-xs">Project Image</span>
              </div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
