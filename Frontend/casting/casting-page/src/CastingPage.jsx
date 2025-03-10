import React from "react";
import { motion } from "framer-motion";


const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-section_content">
        <div className="hero-section_text">
          <motion.h1
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1 }}
          >
            <span className="hero-section_title-bold">Step into the</span>{" "}
            <span className="hero-section_title-highlight">Spotlight</span>
          </motion.h1>
          <motion.p 
            className="hero-section_subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Your Modeling Journey Starts Here!
          </motion.p>
          <motion.button 
            className="hero-section_button"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            APPLY NOW
          </motion.button>
        </div>
        <motion.div 
          className="hero-section_image"
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Image content */}
        </motion.div>
      </div>
    </section>
  );
};

const DiscoverySection = () => {
  return (
    <section className="discovery-section">
      <div className="discovery-section_content">
        <motion.div 
          className="discovery-section_image"
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Image content */}
        </motion.div>
        <div className="discovery-section_text">
          <motion.h2
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="discovery-section_title-bold">Discover Your</span>{" "}
            <span className="discovery-section_title-highlight">Potential</span>
          </motion.h2>
          <motion.p 
            className="discovery-section_subtitle"
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Join Our Growing Community of Models
          </motion.p>
          <motion.button 
            className="discovery-section_button"
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            LEARN MORE
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const FFRSection = () => {
  return (
    <section className="ffr-section">
      <div className="ffr-section_content">
        <div className="ffr-section_left">
          <motion.h2
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="ffr-section_title-bold">HOLD</span>{" "}
            <span className="ffr-section_title-highlight">ON!</span>
          </motion.h2>
        </div>
        <div className="ffr-section_center">
          {/* Center content */}
        </div>
        <div className="ffr-section_right">
          <motion.p 
            className="ffr-section_subtitle"
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            To apply for Modeling Agencies, your account must be set to Public
          </motion.p>
          <motion.button 
            className="ffr-section_button"
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Publicize Account
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const CastingPage = () => {
  return (
    <main className="page-container">
      <HeroSection />
      <DiscoverySection />
      <FFRSection />
    </main>
  );
};

export default CastingPage;