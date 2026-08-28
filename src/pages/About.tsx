import { useSEO } from '../hooks/useSEO';
import React from 'react';
import { motion } from 'motion/react';

export default function About() {
  useSEO({ title: "About Us", description: "Learn about Bhakt & Bhakti Incense, our history, our values, and our commitment to crafting premium natural agarbatti.", path: "/about" });

  return (
    <div className="pt-24 bg-chai-50 min-h-screen">
      {/* Page Header */}
      <section className="bg-espresso-900 py-20 text-chai-50 text-center relative border-b-4 border-kumkum-600">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
        <div className="relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-marigold-400">Our Heritage</h1>
          <p className="text-chai-200 tracking-widest uppercase text-sm font-medium">Bhakt & Bhakti Incense</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-16">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-serif text-4xl mb-6 text-kumkum-600 flex items-center">
              <span className="w-12 h-[2px] bg-marigold-500 mr-4"></span> Who We Are
            </h2>
            <p className="text-espresso-800 leading-relaxed text-lg pl-6 md:pl-16 border-l-2 border-chai-200">
              Bhakt & Bhakti Incense is an Indian incense-stick manufacturing company focused on creating quality agarbatti products with carefully selected raw materials, fragrances and manufacturing processes. We draw inspiration from centuries-old traditional recipes while maintaining modern standards of purity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-chai-100 p-8 rounded-tr-3xl rounded-bl-3xl border border-chai-200 h-full relative group hover:border-marigold-500/50 transition-colors">
                <div className="absolute -top-4 -left-4 text-5xl text-marigold-500/20 font-serif">"</div>
                <h3 className="font-serif text-3xl mb-4 text-espresso-900">Our Vision</h3>
                <p className="text-espresso-700 leading-relaxed">
                  To be a trusted household name for premium fragrances, bringing peace, devotion, and a sense of the divine to every home through our carefully crafted incense products.
                </p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-chai-100 p-8 rounded-tl-3xl rounded-br-3xl border border-chai-200 h-full relative group hover:border-kumkum-500/50 transition-colors">
                <div className="absolute -top-4 -right-4 text-5xl text-kumkum-600/10 font-serif">"</div>
                <h3 className="font-serif text-3xl mb-4 text-espresso-900">Our Mission</h3>
                <p className="text-espresso-700 leading-relaxed">
                  To consistently manufacture high-quality, pure, and aromatic incense sticks while maintaining strict quality control, honoring our cultural roots, and prioritizing customer satisfaction.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-serif text-4xl mb-8 text-kumkum-600 flex items-center">
              <span className="w-12 h-[2px] bg-marigold-500 mr-4"></span> The Bhakti Difference
            </h2>
            <ul className="grid md:grid-cols-2 gap-6 pl-6 md:pl-16">
              {[
                "Carefully selected natural raw materials",
                "Rigorous quality control processes",
                "Premium, long-lasting fragrances",
                "Modern manufacturing facilities",
                "Commitment to consistency",
                "Customer-first approach"
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3 text-espresso-800">
                  <div className="mt-1.5 w-2 h-2 bg-marigold-500 transform rotate-45 shrink-0" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Facilities & Team */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-10">
            <h2 className="font-serif text-4xl mb-10 text-espresso-900 text-center">Our Facilities & Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Founder Photo */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full aspect-[3/4] rounded-t-full overflow-hidden border-4 border-chai-100 shadow-md mb-5 bg-chai-200">
                  <img src="/1747385643571.jpg" alt="Aditya Aryan, Founder and Proprietor of Bhakt & Bhakti Incense" className="w-full h-full object-cover object-top" />
                </div>
                <h3 className="font-serif text-2xl text-espresso-900">Aditya Aryan</h3>
                <p className="text-xs text-kumkum-600 uppercase tracking-widest mt-2 font-bold">Founder & Proprietor</p>
              </div>

              {/* Factory Photo */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full aspect-[3/4] rounded-t-full overflow-hidden border-4 border-chai-100 shadow-md mb-5 bg-chai-200">
                  <img src="/IMG20260819113521.jpg" alt="Bhakt & Bhakti Incense Manufacturing Unit Building Signboard" className="w-full h-full object-cover object-center" />
                </div>
                <h3 className="font-serif text-2xl text-espresso-900">Bhakt & Bhakti Incense</h3>
                <p className="text-xs text-kumkum-600 uppercase tracking-widest mt-2 font-bold">Manufacturing Unit</p>
              </div>

              {/* Production Unit Photo */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full aspect-[3/4] rounded-t-full overflow-hidden border-4 border-chai-100 shadow-md mb-5 bg-chai-200">
                  <img src="/DSC_0476.jpg" alt="Bhakt & Bhakti Production Facility" className="w-full h-full object-cover object-center" />
                </div>
                <h3 className="font-serif text-2xl text-espresso-900">Our Production Facility</h3>
                <p className="text-xs text-kumkum-600 uppercase tracking-widest mt-2 font-bold">Agarbatti Manufacturing</p>
              </div>

              {/* Product Range Photo */}
              <div className="flex flex-col items-center text-center">
                <div className="w-full aspect-[3/4] rounded-t-full overflow-hidden border-4 border-chai-100 shadow-md mb-5 bg-chai-200">
                  <img src="/product-range.png" alt="Complete Product Range of Bhakt & Bhakti Incense" className="w-full h-full object-cover object-top" />
                </div>
                <h3 className="font-serif text-2xl text-espresso-900">Complete Product Range</h3>
                <p className="text-xs text-kumkum-600 uppercase tracking-widest mt-2 font-bold">Bhakt & Bhakti Incense</p>
              </div>

            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
