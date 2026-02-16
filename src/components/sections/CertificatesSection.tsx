import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";

const placeholderCerts = [
  { id: 1, name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2024", link: "#" },
  { id: 2, name: "Google Cloud Professional", issuer: "Google", date: "2023", link: "#" },
  { id: 3, name: "Meta Frontend Developer", issuer: "Meta", date: "2023", link: "#" },
  { id: 4, name: "Certified Scrum Master", issuer: "Scrum Alliance", date: "2022", link: "#" },
];

const CertificatesSection = () => {
  return (
    <section id="certificates" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-2">Certificates</h2>
          <p className="text-muted-foreground mb-12 max-w-lg">Professional certifications and credentials.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {placeholderCerts.map((cert, i) => (
            <motion.a
              key={cert.id}
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all duration-300 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Award size={20} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                {cert.name}
              </h3>
              <p className="text-muted-foreground text-xs mb-1">{cert.issuer}</p>
              <p className="text-muted-foreground text-xs">{cert.date}</p>
              <ExternalLink size={12} className="mx-auto mt-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificatesSection;
