import { useSEO } from '../hooks/useSEO';
import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, ExternalLink, Sparkles } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

export default function Home() {
  useSEO({ title: "Premium Agarbatti Manufacturer", description: "Bhakt & Bhakti Incense is a premium incense-stick manufacturing company offering quality fragrances for every sacred moment.", path: "/" });

  const { products } = useProducts(false);
  
  // Display top 4 featured or active products
  const featuredOfferings = products
    .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || a.display_order - b.display_order)
    .slice(0, 4);

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

      {/* Heritage & Values Intro */}
      <section className="py-24 bg-chai-50 text-espresso-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-[2px] bg-kumkum-600"></span>
                <span className="text-kumkum-600 font-medium tracking-widest uppercase text-xs">Our Story</span>
              </div>
              <h2 className="font-serif text-3xl md:text-5xl mb-6 leading-tight text-espresso-900">
                A Legacy of <br />
                <span className="text-marigold-500 italic">Purity & Tradition</span>
              </h2>
              <p className="text-espresso-700 leading-relaxed mb-6 font-light text-lg">
                Bhakt & Bhakti Incense is an Indian incense-stick manufacturing company focused on creating quality agarbatti products with carefully selected raw materials, fragrances, and manufacturing processes.
              </p>
              <p className="text-espresso-700 leading-relaxed mb-8 font-light text-lg">
                Based in Goraul, Vaishali, Bihar, we blend traditional methods with modern quality control to deliver a consistent, premium experience.
              </p>
              <Link to="/about" className="inline-flex items-center text-kumkum-600 font-medium tracking-wider uppercase text-sm group hover:text-kumkum-500">
                Discover Our Heritage <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-t-full overflow-hidden border-8 border-chai-100 shadow-2xl relative z-10 bg-chai-200">
                <img 
                  src="/agarbatti_facility.jpg" 
                  alt="Bhakt & Bhakti Premium Agarbatti Manufacturing Facility" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full rounded-t-full border-2 border-marigold-500/30 z-0 hidden sm:block" />

              {/* Pure Devotion Badge */}
              <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 bg-kumkum-700 text-chai-50 rounded-full w-28 h-28 sm:w-36 sm:h-36 flex flex-col items-center justify-center border-4 border-chai-50 shadow-2xl z-20 text-center">
                <span className="font-serif text-xl sm:text-2xl text-marigold-300 font-bold leading-tight">Pure</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-chai-100 font-medium">Devotion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Sacred Collections */}
      <section className="py-24 bg-espresso-900 text-chai-50 relative">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-marigold-400">Sacred Collections</h2>
            <p className="text-chai-200 max-w-2xl mx-auto text-lg">Explore our finest fragrances, crafted to elevate your space and spirit.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredOfferings.map((prod) => (
              <motion.div 
                key={prod.id}
                whileHover={{ y: -5 }}
                className="bg-chai-50 rounded-t-[100px] overflow-hidden shadow-xl transition-all duration-300 border-b-4 border-kumkum-600 group flex flex-col"
              >
                <div className="h-56 md:h-64 overflow-hidden relative p-4 pt-6 bg-chai-100 flex items-center justify-center rounded-t-[90px]">
                  <Link to={`/product/${prod.slug || prod.id}`} className="w-full h-full flex items-center justify-center">
                    <img 
                      src={prod.image} 
                      alt={`Bhakt & Bhakti ${prod.name} Incense Sticks`} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                    />
                  </Link>
                  <div className="absolute top-6 right-6 bg-kumkum-600 text-chai-50 text-[10px] px-3 py-1 uppercase tracking-widest font-medium rounded-full shadow-md z-10">
                    {prod.availability_label || (prod.is_featured ? 'Featured' : 'Available Now')}
                  </div>
                </div>
                <div className="p-6 pt-5 text-center flex-1 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-marigold-600 tracking-wider mb-1 block">
                    {prod.category}
                  </span>
                  <h3 className="font-serif text-2xl mb-2 text-espresso-900 font-bold">
                    <Link to={`/product/${prod.slug || prod.id}`} className="hover:text-kumkum-600 transition-colors">
                      {prod.name}
                    </Link>
                  </h3>
                  <p className="text-espresso-700 text-xs mb-4 leading-relaxed line-clamp-2 min-h-[2rem]">
                    {prod.description}
                  </p>
                  <div className="mt-auto">
                    <div className="text-kumkum-600 font-bold text-base mb-3">₹{prod.price}</div>
                    <Link 
                      to={`/product/${prod.slug || prod.id}`} 
                      className="inline-block w-full py-3 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest hover:bg-marigold-400 transition-colors rounded-sm text-xs"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent border-2 border-marigold-500 text-marigold-400 font-bold text-xs uppercase tracking-widest rounded hover:bg-marigold-500 hover:text-espresso-900 transition-colors"
            >
              View Full Sacred Catalog <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Follow Section */}
      <section className="py-20 bg-gradient-to-b from-espresso-900 via-espresso-950 to-espresso-900 text-chai-50 relative overflow-hidden border-t border-b border-marigold-500/20">
        <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-espresso-850 to-espresso-900 border-2 border-marigold-500/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Ambient Gold Glows */}
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-marigold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-kumkum-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative z-10">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-marigold-500/10 border border-marigold-500/30 text-marigold-400 text-xs uppercase tracking-widest font-semibold">
                  <Sparkles size={13} className="text-marigold-400" />
                  Connect With Us
                </div>
                
                <h2 className="font-serif text-3xl md:text-4xl text-chai-50 leading-tight">
                  Follow Our Sacred Journey on <span className="text-marigold-400">Instagram</span>
                </h2>
                
                <p className="text-chai-200 text-sm md:text-base leading-relaxed font-light">
                  Follow <span className="font-medium text-marigold-400">@bhaktandbhaktiincense</span> for glimpses into our artisanal agarbatti craftsmanship, daily devotional inspiration, and new fragrant arrivals.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  <span className="text-[11px] uppercase tracking-wider text-chai-300 bg-espresso-950/70 px-3 py-1 rounded-full border border-espresso-700">Artisan Craft</span>
                  <span className="text-[11px] uppercase tracking-wider text-chai-300 bg-espresso-950/70 px-3 py-1 rounded-full border border-espresso-700">Sacred Aromas</span>
                  <span className="text-[11px] uppercase tracking-wider text-chai-300 bg-espresso-950/70 px-3 py-1 rounded-full border border-espresso-700">New Launches</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-3 w-full md:w-auto">
                <a
                  href="https://www.instagram.com/bhaktandbhaktiincense/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Bhakt & Bhakti Incense on Instagram"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-marigold-500 via-marigold-400 to-marigold-500 text-espresso-950 font-bold uppercase tracking-widest text-xs md:text-sm rounded-xl shadow-lg hover:shadow-marigold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto"
                >
                  <div className="w-6 h-6 rounded bg-espresso-950 text-marigold-400 flex items-center justify-center transition-transform group-hover:rotate-6">
                    <Instagram size={15} />
                  </div>
                  <span>Follow on Instagram</span>
                  <ExternalLink size={15} className="text-espresso-950/70" />
                </a>
                <span className="text-xs text-chai-300 tracking-widest font-mono">
                  @bhaktandbhaktiincense
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
