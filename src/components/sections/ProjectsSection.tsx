import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const placeholderProjects = [
  { id: 1, title: "HomeLab | Personal Physical Server", description: "Repurposing old hardware to build personal Ubunti server from ground up, with Compute, Store, network and database hosting capability", tags: ["Linux", "Docker", "Cloudflare"], link: "https://github.com/Dhruv-SP/Home-lab", image:"ubuntu_homelab_center.png"},
  { id: 2, title: "System Flow generator and analysis", description: "An AI powered tool to generate line analysis graph of a given system description.", tags: ["AWS", "LangChain", "Streamlit"], link: "https://portfolio.dhruvhere.info/system-flow", image: "system_flow_3_2.jpg" },
  // { id: 3, title: "Project Gamma", description: "Data visualization dashboard for monitoring key business metrics.", tags: ["D3.js", "Python", "PostgreSQL"], link: "#" },
  // { id: 4, title: "Project Delta", description: "AI-powered content management system with smart categorization.", tags: ["AI/ML", "Node.js", "AWS"], link: "#" },
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
              <div className="h-40 bg-secondary rounded-lg mb-5 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
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
