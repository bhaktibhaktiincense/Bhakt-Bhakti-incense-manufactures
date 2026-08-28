import { useSEO } from '../hooks/useSEO';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function Products() {
  useSEO({ title: "Our Incense Products", description: "Explore our premium collection of handcrafted incense sticks. Shop natural, soothing fragrances for devotion and meditation.", path: "/products" });

  const { addToCart } = useCart();
  
  const products = [
    {
      id: "rajnigandha",
      name: "Rajnigandha Premium",
      desc: "Experience the sweet, floral elegance of the night-blooming tuberose.",
      img: "/IMG-20260808-WA0005.jpg",
      packSize: "100g",
      mrp: 150,
      available: true
    },
    {
      id: "mogra",
      name: "Mogra Essence",
      desc: "The delicate and pure fragrance of Indian Jasmine.",
      img: "/IMG-20260808-WA0003.jpg",
      packSize: "100g",
      mrp: 150,
      available: true
    },
    {
      id: "gulab",
      name: "Gulab (Rose) Premium",
      desc: "Infused with the timeless aroma of fresh Roses.",
      img: "/IMG-20260808-WA0004.jpg",
      packSize: "100g",
      mrp: 150,
      available: true
    },
    {
      id: "sandalwood",
      name: "Sandalwood Classic",
      desc: "A timeless classic.",
      img: "/1777729364289.png",
      packSize: "100g",
      mrp: 150,
      available: true
    }
  ];

  return (
    <div className="pt-24 bg-chai-50 min-h-screen">
      <section className="bg-espresso-900 py-20 text-chai-50 text-center px-6 relative border-b-4 border-kumkum-600">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
        <div className="relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-marigold-400">Our Sacred Offerings</h1>
          <p className="text-chai-200 tracking-wide max-w-2xl mx-auto">Premium fragrances crafted for every moment of devotion.</p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((prod) => (
            <motion.div 
              key={prod.id}
              whileHover={{ y: -5 }}
              className={`bg-chai-50 rounded-t-[100px] overflow-hidden shadow-xl transition-all duration-300 border-b-4 ${prod.available ? 'border-kumkum-600 group' : 'border-espresso-700 opacity-80'}`}
            >
              <div className="h-72 md:h-96 overflow-hidden relative p-4 pt-4 bg-chai-100 flex items-center justify-center">
                <img 
                  src={prod.img} 
                  alt={`Bhakt & Bhakti ${prod.name} Incense Sticks`} 
                  className={`w-full h-full object-contain transition-transform duration-700 ${prod.available ? 'group-hover:scale-105' : 'opacity-60 mix-blend-luminosity'}`} 
                />
                {!prod.available && (
                  <div className="absolute top-8 right-6 bg-espresso-900 text-marigold-400 text-xs px-4 py-1.5 uppercase tracking-widest font-medium rounded-full shadow-md">
                    Coming Soon
                  </div>
                )}
                {prod.available && (
                  <div className="absolute top-8 right-6 bg-kumkum-600 text-chai-50 text-xs px-4 py-1.5 uppercase tracking-widest font-medium rounded-full shadow-md">
                    Available Now
                  </div>
                )}
              </div>
              <div className="p-8 pt-6 text-center">
                <h3 className="font-serif text-3xl mb-3 text-espresso-900">{prod.name}</h3>
                <p className="text-espresso-700 text-sm mb-6 leading-relaxed min-h-[3rem]">{prod.desc}</p>
                
                <div className="flex justify-center items-center gap-6 mb-8 text-sm border-t border-b border-marigold-500/20 py-4">
                  <div><span className="text-espresso-700/70 block text-xs uppercase tracking-wider mb-1">Pack Size</span> <span className="font-bold text-espresso-900 text-base">{prod.packSize}</span></div>
                  <div className="w-[1px] h-8 bg-marigold-500/20"></div>
                  <div><span className="text-espresso-700/70 block text-xs uppercase tracking-wider mb-1">Price</span> <span className="font-bold text-kumkum-600 text-base">₹{prod.mrp}</span></div>
                </div>

                {prod.available ? (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        addToCart({
                          product_id: prod.id,
                          name: prod.name,
                          price: prod.mrp,
                          quantity: 1,
                          image: prod.img
                        });
                        alert(`Added ${prod.name} to cart`);
                      }}
                      className="w-full py-3.5 bg-espresso-900 text-chai-50 font-bold uppercase tracking-widest hover:bg-espresso-800 transition-colors rounded-sm flex items-center justify-center gap-2 text-sm"
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>
                    <Link to={`/contact?product=${encodeURIComponent(prod.name)}`} className="block w-full py-3.5 border-2 border-marigold-500 text-espresso-900 font-bold uppercase tracking-widest hover:bg-marigold-50 transition-colors rounded-sm text-center text-sm">
                      Bulk Enquiry
                    </Link>
                  </div>
                ) : (
                  <button disabled className="w-full py-3.5 border border-espresso-700 text-espresso-700 font-bold uppercase tracking-widest cursor-not-allowed rounded-sm bg-chai-100">
                    In Development
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
