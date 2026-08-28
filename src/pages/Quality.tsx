import { useSEO } from '../hooks/useSEO';
import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function Quality() {
  useSEO({ title: "Quality Standards", description: "Our commitment to purity and quality. Read about our rigorous testing and pure ingredient sourcing for the best agarbatti.", path: "/quality" });

  return (
    <div className="pt-24 bg-chai-50 min-h-screen">
      <section className="bg-espresso-900 py-20 text-chai-50 text-center px-6 relative border-b-4 border-kumkum-600">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
        <div className="relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-marigold-400">Our Commitment to Quality</h1>
          <p className="text-chai-200 tracking-wide max-w-2xl mx-auto">Ensuring purity, consistency, and a premium experience in every stick.</p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 lg:px-12 max-w-5xl">
        <div className="space-y-12">
          
          {[
            { title: "Raw Material Selection", desc: "We meticulously source our raw materials to ensure they meet our strict internal standards before entering the production floor." },
            { title: "Fragrance Quality", desc: "Our perfumes are selected for their depth, longevity, and stability during the burning process." },
            { title: "Consistent Production", desc: "Modern machinery ensures that every incense stick is uniform in thickness and composition." },
            { title: "Proper Drying", desc: "Controlled environments prevent cracking and ensure an even burn rate." },
            { title: "Product Finishing", desc: "Each batch is visually inspected for defects, ensuring only perfect sticks reach the consumer." },
            { title: "Packaging Quality", desc: "Our premium packaging protects the incense from moisture and preserves the fragrance integrity." },
            { title: "Final Quality Inspection", desc: "Randomized batch testing for burn time, ash fall, and aromatic throw." }
          ].map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4 md:space-x-6 bg-chai-100 p-6 md:p-8 rounded-tr-3xl rounded-bl-3xl shadow-sm border border-marigold-500/20 hover:border-marigold-500 transition-colors"
            >
              <CheckCircle2 className="text-kumkum-600 shrink-0 mt-1" size={32} />
              <div>
                <h3 className="font-serif text-3xl text-espresso-900 mb-2">{item.title}</h3>
                <p className="text-espresso-800 leading-relaxed text-lg">{item.desc}</p>
              </div>
            </motion.div>
          ))}
          
        </div>

        {/* Certifications Placeholder */}
        <div className="mt-24 text-center">
          <h2 className="font-serif text-4xl mb-8 text-espresso-900 flex items-center justify-center">
            <span className="w-8 h-[2px] bg-marigold-500 mr-4"></span> 
            Certifications & Standards 
            <span className="w-8 h-[2px] bg-marigold-500 ml-4"></span>
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="w-40 h-40 md:w-48 md:h-48 bg-chai-100 flex items-center justify-center text-sm text-espresso-700 border-2 border-dashed border-marigold-500/50 rounded-full">
              [Editable Certification Placeholder]
            </div>
            <div className="w-40 h-40 md:w-48 md:h-48 bg-chai-100 flex items-center justify-center text-sm text-espresso-700 border-2 border-dashed border-marigold-500/50 rounded-full">
              [Editable Certification Placeholder]
            </div>
          </div>
          <p className="mt-8 text-sm text-espresso-700/70 italic">* Certifications will be displayed upon official verification and upload.</p>
        </div>
      </section>
    </div>
  );
}
