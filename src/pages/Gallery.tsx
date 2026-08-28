import React, { useState, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Gallery() {
  useSEO({ 
    title: "Our Gallery", 
    description: "A glimpse into the fragrance, devotion and craftsmanship of Bhakt & Bhakti.", 
    path: "/gallery" 
  });

  const galleryImages = [
    { src: "/file_0000000041dc8211a21e7fa5a8c5dc88.png", alt: "Premium Assortment Display", category: "Products" },
    { src: "/file_0000000099dc81fd9d3bb56913b2581e.png", alt: "Mogra Incense Features", category: "Products" },
    { src: "/file_00000000c0888208b46eb860c5e12430.png", alt: "Mogra Packaging Details", category: "Products" },
    { src: "/1787756197856.png", alt: "Premium Collection", category: "Products" },
    { src: "/1787756687130.png", alt: "Rajnigandha Collection", category: "Products" },
    { src: "/1787756098495.png", alt: "Mogra Collection", category: "Products" },
    { src: "/file_0000000082b082118eccc68f62e46e87.png", alt: "Rajnigandha Incense Box", category: "Products" },
    { src: "/file_00000000d02c8207b425d387f822c9e1.png", alt: "Rajnigandha Display", category: "Products" },
    { src: "/1787755453669.png", alt: "Mogra Display", category: "Products" },
    { src: "/product-range.png", alt: "Complete Product Range", category: "Products" },
    { src: "/IMG-20260808-WA0005.jpg", alt: "Rajnigandha Premium Incense", category: "Products" },
    { src: "/IMG-20260808-WA0004.jpg", alt: "Gulab Premium Incense", category: "Products" },
    { src: "/IMG-20260808-WA0003.jpg", alt: "Mogra Premium Incense", category: "Products" },
    { src: "/1777729364289.png", alt: "Sandalwood Premium Incense", category: "Products" },
    { src: "/IMG20260819113612_BURST001.jpg", alt: "Manufacturing Process", category: "Facility" },
    { src: "/IMG20260819113521.jpg", alt: "Bhakt & Bhakti Factory", category: "Facility" },
    { src: "/1747385643571.jpg", alt: "Founder", category: "Team" },
  ];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  return (
    <div className="pt-24 bg-chai-50 min-h-screen">
      {/* Page Header */}
      <section className="bg-espresso-900 py-20 text-chai-50 text-center px-6 relative border-b-4 border-kumkum-600">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
        <div className="relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-marigold-400">Our Gallery</h1>
          <p className="text-chai-200 tracking-wide max-w-2xl mx-auto">
            A glimpse into the fragrance, devotion and craftsmanship of Bhakt & Bhakti.
          </p>
        </div>
      </section>

      {/* Grid Layout */}
      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {galleryImages.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 3) * 0.1 }}
              className="break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden shadow-md border-4 border-chai-100 hover:border-marigold-400 transition-all duration-500 bg-chai-100"
              onClick={() => openLightbox(index)}
            >
              <img 
                src={img.src} 
                alt={img.alt} 
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-espresso-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <span className="text-chai-50 font-medium tracking-widest uppercase text-sm border border-chai-50 px-6 py-3 rounded-sm">
                   View Image
                 </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-espresso-900/95 backdrop-blur-sm flex items-center justify-center"
          >
            <button 
              onClick={closeLightbox} 
              className="absolute top-6 right-6 text-chai-200 hover:text-white transition-colors z-[110] p-2 bg-espresso-900/50 rounded-full"
              aria-label="Close"
            >
              <X size={32} strokeWidth={1.5} />
            </button>
            
            <button 
              onClick={prevImage} 
              className="absolute left-2 md:left-8 text-chai-200 hover:text-white transition-colors z-[110] p-3 bg-espresso-900/50 hover:bg-espresso-800 rounded-full"
              aria-label="Previous"
            >
              <ChevronLeft size={36} strokeWidth={1.5} />
            </button>
            
            <button 
              onClick={nextImage} 
              className="absolute right-2 md:right-8 text-chai-200 hover:text-white transition-colors z-[110] p-3 bg-espresso-900/50 hover:bg-espresso-800 rounded-full"
              aria-label="Next"
            >
              <ChevronRight size={36} strokeWidth={1.5} />
            </button>
            
            <div 
              className="w-full h-full p-6 md:p-20 flex flex-col items-center justify-center relative cursor-pointer" 
              onClick={closeLightbox}
            >
              <motion.img 
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={galleryImages[currentIndex].src} 
                alt={galleryImages[currentIndex].alt} 
                className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-md cursor-default" 
                onClick={(e) => e.stopPropagation()}
              />
              
              <div 
                className="absolute bottom-8 md:bottom-12 left-0 right-0 text-center text-chai-100 px-6 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="font-serif text-xl md:text-3xl text-chai-50 drop-shadow-md">
                  {galleryImages[currentIndex].alt}
                </p>
                <p className="text-xs tracking-widest uppercase mt-3 text-marigold-400 font-bold drop-shadow-md">
                  {galleryImages[currentIndex].category}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
