import { motion } from "framer-motion";
import { Linkedin, Mail, Phone, Github, Twitter } from "lucide-react";

const contactLinks = [
  { icon: Mail, label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
  { icon: Linkedin, label: "LinkedIn", value: "linkedin.com/in/yourname", href: "https://linkedin.com" },
  { icon: Phone, label: "Phone", value: "+1 (555) 000-0000", href: "tel:+15550000000" },
  { icon: Github, label: "GitHub", value: "github.com/yourname", href: "https://github.com" },
  { icon: Twitter, label: "Twitter / X", value: "@yourhandle", href: "https://x.com" },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-2">Get In Touch</h2>
          <p className="text-muted-foreground mb-12 max-w-md mx-auto">
            Feel free to reach out through any of the platforms below.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {contactLinks.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group flex items-center gap-4 bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all duration-300"
            >
              <div className="p-2.5 rounded-lg bg-primary/10">
                <item.icon size={18} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.value}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-xs mt-16"
        >
          © {new Date().getFullYear()} Your Name. All rights reserved.
        </motion.p>
      </div>
    </section>
  );
};

export default ContactSection;
