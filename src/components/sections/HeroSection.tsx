import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="about" className="min-h-screen flex items-center justify-center relative px-6 pt-20" style={{backgroundColor: '#1445525f'}}>
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center ">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">Hey there, I'm</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Dhruv Patel
          </h1>
          <p className="text-xl md:text-2xl text-white-foreground mb-4">
            Data Engineer | Mentor | AWS Certified 
          </p>
          <p className="text-white-foreground leading-relaxed max-w-lg mb-8">
            Driven by curiocity.
            <br></br>
            Engineering AWS native data and automation solutions. With interest in AI/ML, Cloud and homelabbing, 
            I bring a diverse experience into your team. 
          </p>
          <a
            href="#projects"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            View My Work
            <ArrowDown size={16} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-2xl bg-secondary border border-border overflow-hidden">
            <img
              src="/1689728661588.jpeg"
              alt="Dhruv Patel"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <a href="#projects" className="text-muted-foreground hover:text-primary transition-colors animate-bounce block">
          <ArrowDown size={20} />
        </a>
      </motion.div>
    </section>
  );
};

export default HeroSection;
