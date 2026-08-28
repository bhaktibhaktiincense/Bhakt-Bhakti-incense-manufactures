import { useSEO } from '../hooks/useSEO';
import React from 'react';
import { motion } from 'motion/react';
import { Settings, Droplets, AlignVerticalSpaceAround, Wind, Sparkles, ShieldCheck, Box, Truck } from 'lucide-react';

export default function Manufacturing() {
  useSEO({ title: "Manufacturing Process", description: "Discover how our premium incense sticks are crafted with natural ingredients, traditional techniques, and strict quality control.", path: "/manufacturing" });

  const steps = [
    { icon: <Settings size={28} />, title: "Raw Material Selection", desc: "Careful sourcing of premium bamboo sticks, charcoal, joss powder, and natural binders." },
    { icon: <Droplets size={28} />, title: "Mixing & Preparation", desc: "Precise blending of ingredients to create a smooth, consistent base dough." },
    { icon: <AlignVerticalSpaceAround size={28} />, title: "Stick Production", desc: "Extruding the mixture uniformly onto bamboo cores using modern machinery." },
    { icon: <Wind size={28} />, title: "Drying", desc: "Controlled drying process to ensure optimal moisture content and prevent breakage." },
    { icon: <Sparkles size={28} />, title: "Fragrance Application", desc: "Dipping or spraying sticks with carefully formulated, premium perfumes." },
    { icon: <ShieldCheck size={28} />, title: "Quality Checking", desc: "Rigorous inspection of burn time, aroma spread, and physical consistency." },
    { icon: <Box size={28} />, title: "Packaging", desc: "Sealing incense in moisture-resistant, elegant packaging to preserve fragrance." },
    { icon: <Truck size={28} />, title: "Final Dispatch", desc: "Careful boxing and shipping to our distributors and retail partners." }
  ];

  return (
    <div className="pt-24 bg-chai-50 min-h-screen">
      <section className="bg-espresso-900 py-20 text-chai-50 text-center px-6 relative border-b-4 border-kumkum-600">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
        <div className="relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-marigold-400">The Art of Manufacturing</h1>
          <p className="text-chai-200 tracking-wide max-w-2xl mx-auto">Blending traditional Indian methods with modern, efficient production facilities.</p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-chai-50 p-8 rounded-t-full rounded-b-xl shadow-md border-2 border-chai-100 flex flex-col items-center text-center hover:border-marigold-400 transition-colors group relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-chai-100 rounded-full flex items-center justify-center text-kumkum-600 mb-6 border border-marigold-500/20 group-hover:bg-marigold-500 group-hover:text-espresso-900 transition-colors z-10">
                {step.icon}
              </div>
              <div className="text-xs text-marigold-600 font-bold mb-3 tracking-widest uppercase z-10">Step 0{index + 1}</div>
              <h3 className="font-serif text-2xl text-espresso-900 mb-4 z-10">{step.title}</h3>
              <p className="text-espresso-700 text-sm leading-relaxed z-10">{step.desc}</p>
              
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-chai-100/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20">
          <div className="w-full h-64 md:h-96 bg-espresso-800 flex items-center justify-center text-chai-200 border-4 border-marigold-500/30 rounded-t-[100px] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1629851608674-0f307dfb918d?q=80&w=2000&auto=format&fit=crop")',
              backgroundSize: 'cover', backgroundPosition: 'center'
            }}></div>
            <span className="relative z-10 font-serif text-2xl">[Factory / Production Images Placeholder]</span>
          </div>
        </div>
      </section>
    </div>
  );
}
