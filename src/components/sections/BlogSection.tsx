import { motion } from "framer-motion";
import { ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const placeholderPosts = [
  { id: 1, title: "Stelvio, Python as IaC", excerpt: "I came across Stelvio a few days back, and… I've a conundrum...", date: "Feb 2026", tags: ["DevOps", "IaC"], link: "https://www.linkedin.com/posts/dhruvsp_i-came-across-stelvio-a-few-days-back-and-activity-7428121084127907840-9qxf?utm_source=share&utm_medium=member_desktop&rcm=ACoAACv3P1IBsvssGrLn539KEWu9pgJX6jYKwdM" },
  { id: 2, title: "Homelab", excerpt: "A quick post about how I optimize my personal projects hosting cost from $50-60/month to $0.Yup $𝟬 ...", date: "Jan 2026", tags: ["Ubuntu", "Hosting"], link: "https://www.linkedin.com/posts/dhruvsp_a-quick-post-about-how-i-optimize-my-personal-activity-7419424372332867586-q2sL?utm_source=share&utm_medium=member_desktop&rcm=ACoAACv3P1IBsvssGrLn539KEWu9pgJX6jYKwdM" },
  //{ id: 3, title: "Design Systems That Scale", excerpt: "How to build and maintain design systems that work across teams and products.", date: "Nov 2024", tags: ["Design", "Frontend"], link: "#" },
];

const BlogSection = () => {
  return (
    <section id="blog" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-2">Blogs & Posts</h2>
          <p className="text-muted-foreground mb-12 max-w-lg">Thoughts, tutorials, and insights I've published.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {placeholderPosts.map((post, i) => (
            <motion.a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-4">
                <Calendar size={12} />
                {post.date}
              </div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
