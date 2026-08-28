import { useSEO } from '../hooks/useSEO';
import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  useSEO({ title: "Premium Agarbatti Manufacturer", description: "Bhakt & Bhakti Incense is a premium incense-stick manufacturing company offering quality fragrances for every sacred moment.", path: "/" });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden bg-espresso-900 py-24">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1608670498762-b91cbfdcba64?q=80&w=2070&auto=format&fit=crop" 
            alt="Incense Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-900 via-espresso-900/60 to-transparent" />
          
          {/* Subtle Mandala/Traditional Motif Overlay */}
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23D4AC0D\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'40\' fill=\'none\' stroke=\'%23D4AC0D\' stroke-width=\'2\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'30\' fill=\'none\' stroke=\'%23D4AC0D\' stroke-width=\'1\' stroke-dasharray=\'4 4\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '300px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-6 text-center flex flex-col items-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-marigold-400 tracking-[0.4em] uppercase text-sm mb-6 font-medium">Bhakt & Bhakti Incense</span>
            
            <h1 className="font-serif text-4xl md:text-7xl lg:text-8xl mb-6 max-w-5xl leading-tight text-chai-50">
              Crafting Fragrance,<br/>
              <span className="text-marigold-500 italic">Creating Devotion.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-chai-100 max-w-2xl mb-12 font-light leading-relaxed">
              Premium incense sticks crafted with care, quality fragrances and a commitment to creating a beautiful experience in every moment of devotion.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to="/products" className="px-8 py-4 bg-kumkum-600 text-chai-50 font-medium tracking-widest uppercase rounded-sm hover:bg-kumkum-500 transition-colors duration-300 w-full sm:w-auto text-center border border-kumkum-500">
                Explore Products
              </Link>
              <Link to="/about" className="px-8 py-4 bg-transparent border-2 border-marigold-500 text-marigold-400 font-medium tracking-widest uppercase rounded-sm hover:bg-marigold-500 hover:text-espresso-900 transition-all duration-300 w-full sm:w-auto text-center">
                About Our Company
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <span className="w-12 h-[2px] bg-kumkum-500 mr-4"></span>
                <span className="text-kumkum-600 tracking-widest uppercase text-sm font-medium">Our Story</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 text-espresso-900 leading-tight">A Legacy of <br/><span className="text-marigold-600 italic">Purity & Tradition</span></h2>
              <p className="text-espresso-800 leading-relaxed mb-6 text-lg">
                Bhakt & Bhakti Incense is an Indian incense-stick manufacturing company focused on creating quality agarbatti products with carefully selected raw materials, fragrances, and manufacturing processes.
              </p>
              <p className="text-espresso-800 leading-relaxed mb-8">
                Based in Goraul, Vaishali, Bihar, we blend traditional methods with modern quality control to deliver a consistent, premium experience.
              </p>
              <Link to="/about" className="inline-flex items-center text-kumkum-600 font-bold uppercase tracking-wider hover:text-kumkum-700 transition-colors group text-sm">
                Discover Our Heritage <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] md:h-[600px] flex justify-center items-center mt-12 md:mt-0"
            >
              <div className="absolute inset-0 bg-marigold-100/50 rounded-t-full transform translate-x-4 translate-y-4"></div>
              <img 
                src="/file_00000000aa9481fa82329b99e103da5e.png" 
                alt="Bhakt & Bhakti Premium Incense Sticks" 
                className="w-full h-full object-cover rounded-t-full z-10 border-4 border-chai-50 shadow-xl"
              />
              <div className="absolute -bottom-6 -left-2 w-36 h-36 md:w-48 md:h-48 bg-kumkum-600 rounded-full p-4 md:p-8 flex items-center justify-center text-chai-50 flex-col shadow-2xl z-20 border-4 border-chai-50">
                <span className="font-serif text-3xl md:text-4xl mb-1 text-marigold-400">Pure</span>
                <span className="text-xs tracking-widest uppercase">Devotion</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-24 bg-espresso-900 text-chai-50 relative">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-marigold-400">Sacred Collections</h2>
            <p className="text-chai-200 max-w-2xl mx-auto text-lg">Explore our finest fragrances, crafted to elevate your space and spirit.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Main Product */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-chai-50 rounded-t-[100px] overflow-hidden shadow-xl transition-all duration-300 border-b-4 border-kumkum-600 group"
            >
              <div className="h-56 md:h-72 overflow-hidden relative p-6 pt-8 bg-chai-100 flex items-center justify-center rounded-t-[90px]">
                <img src="/IMG-20260808-WA0005.jpg" alt="Bhakt & Bhakti Rajnigandha Premium Incense Sticks" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-8 right-6 bg-kumkum-600 text-chai-50 text-xs px-4 py-1.5 uppercase tracking-widest font-medium rounded-full shadow-md z-10">Premium</div>
              </div>
              <div className="p-8 pt-6 text-center">
                <h3 className="font-serif text-3xl mb-3 text-espresso-900">Rajnigandha</h3>
                <p className="text-espresso-700 text-sm mb-8 leading-relaxed">Experience the sweet, floral elegance of the night-blooming tuberose.</p>
                <Link to="/products" className="inline-block w-full py-3.5 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest hover:bg-marigold-400 transition-colors rounded-sm">
                  View Details
                </Link>
              </div>
            </motion.div>
            
            {/* Other Products */}
            {[
              { name: 'Gulab (Rose)', img: '/IMG-20260808-WA0004.jpg', desc: 'Infused with the timeless aroma of fresh Roses.', alt: 'Bhakt & Bhakti Gulab Premium Incense Sticks' },
              { name: 'Sandalwood', img: '/1777729364289.png', desc: 'A timeless classic fragrance for your sacred spaces.', alt: 'Bhakt & Bhakti Sandalwood Premium Incense Sticks' },
              { name: 'Mogra', img: '/IMG-20260808-WA0003.jpg', desc: 'The delicate and pure fragrance of Indian Jasmine.', alt: 'Bhakt & Bhakti Mogra Premium Incense Sticks' }
            ].map((prod) => (
              <motion.div 
                key={prod.name}
                whileHover={{ y: -5 }}
                className="bg-chai-50 rounded-t-[100px] overflow-hidden shadow-xl transition-all duration-300 border-b-4 border-kumkum-600 group"
              >
                <div className="h-56 md:h-72 overflow-hidden relative p-6 pt-8 bg-chai-100 flex items-center justify-center rounded-t-[90px]">
                  <img src={prod.img} alt={prod.alt} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-8 right-6 bg-kumkum-600 text-chai-50 text-xs px-4 py-1.5 uppercase tracking-widest font-medium rounded-full shadow-md z-10">Available Now</div>
                </div>
                <div className="p-8 pt-6 text-center">
                  <h3 className="font-serif text-3xl mb-3 text-espresso-900">{prod.name}</h3>
                  <p className="text-espresso-700 text-sm mb-8 leading-relaxed">{prod.desc}</p>
                  <Link to="/products" className="inline-block w-full py-3.5 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest hover:bg-marigold-400 transition-colors rounded-sm">
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
