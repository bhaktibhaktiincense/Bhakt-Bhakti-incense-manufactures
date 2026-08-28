import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Manufacturing', path: '/manufacturing' },
    { name: 'Quality', path: '/quality' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b',
        isScrolled 
          ? 'bg-chai-50/95 backdrop-blur-md border-marigold-500/20 py-3 shadow-sm' 
          : 'bg-gradient-to-b from-espresso-900/80 to-transparent border-transparent py-6'
      )}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex flex-col z-50 items-center">
          <span className={cn(
            "font-serif text-2xl tracking-widest font-bold uppercase transition-colors duration-300",
            isScrolled ? "text-kumkum-600" : "text-chai-50"
          )}>
            Bhakt & Bhakti
          </span>
          <span className={cn(
            "text-[0.65rem] tracking-[0.3em] uppercase transition-colors duration-300 font-medium",
            isScrolled ? "text-marigold-600" : "text-marigold-400"
          )}>
            Incense
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                'text-sm font-medium tracking-widest uppercase transition-colors relative group',
                isScrolled 
                  ? (location.pathname === link.path ? 'text-kumkum-600' : 'text-espresso-800 hover:text-kumkum-500')
                  : (location.pathname === link.path ? 'text-marigold-400' : 'text-chai-100 hover:text-marigold-400')
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-1 left-1/2 w-0 h-0.5 bg-marigold-500 transition-all duration-300 group-hover:w-full group-hover:left-0",
                location.pathname === link.path && "w-full left-0"
              )} />
            </Link>
          ))}
        </nav>

        {/* Desktop Right (Cart, Auth, CTA) */}
        <div className="hidden lg:flex items-center space-x-6">
          
          <Link to="/cart" className={cn(
            "relative p-2 transition-colors",
            isScrolled ? "text-espresso-900 hover:text-kumkum-600" : "text-chai-50 hover:text-marigold-400"
          )}>
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-kumkum-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to="/account" className={cn(
              "flex items-center gap-2 p-2 transition-colors",
              isScrolled ? "text-espresso-900 hover:text-kumkum-600" : "text-chai-50 hover:text-marigold-400"
            )}>
              <User size={22} />
            </Link>
          ) : (
            <Link to="/login" className={cn(
              "text-sm font-medium tracking-widest uppercase transition-colors",
              isScrolled ? "text-espresso-800 hover:text-kumkum-600" : "text-chai-50 hover:text-marigold-400"
            )}>
              Login / Sign Up
            </Link>
          )}

          <Link
            to="/contact"
            className={cn(
              "px-5 py-2 text-sm font-medium tracking-widest uppercase rounded-sm transition-all duration-300 border-2",
              isScrolled
                ? "bg-kumkum-600 border-kumkum-600 text-chai-50 hover:bg-transparent hover:text-kumkum-600"
                : "bg-marigold-500 border-marigold-500 text-espresso-900 hover:bg-transparent hover:text-marigold-400 hover:border-marigold-400"
            )}
          >
            Enquire
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden z-50 flex items-center gap-4">
          <Link to="/cart" className={cn(
            "relative p-1 transition-colors",
            isScrolled || mobileMenuOpen ? "text-espresso-900" : "text-chai-50"
          )}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-kumkum-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className={cn(
              "p-1",
              isScrolled || mobileMenuOpen ? "text-espresso-900" : "text-chai-50"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 100% 0)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 100% 0)' }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-[100svh] bg-chai-50 z-40 flex flex-col pt-28 px-8 overflow-y-auto pb-10"
          >
            <nav className="flex flex-col space-y-6">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  key={link.name}
                >
                  <Link
                    to={link.path}
                    className="font-serif text-3xl text-espresso-900 hover:text-kumkum-600 transition-colors block"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-6 mt-4 border-t border-marigold-500/30"
              >
                {user ? (
                  <Link to="/account" className="text-xl font-medium tracking-wide uppercase text-espresso-900 flex items-center">
                    <User size={20} className="mr-3 text-kumkum-600" /> My Account
                  </Link>
                ) : (
                  <Link to="/login" className="text-xl font-medium tracking-wide uppercase text-espresso-900 flex items-center">
                    <User size={20} className="mr-3 text-kumkum-600" /> Login / Sign Up
                  </Link>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="pt-6 mt-2 border-t border-marigold-500/30 flex flex-col space-y-4"
              >
                <Link to="/feedback" className="text-lg font-medium tracking-wide uppercase text-kumkum-600 flex items-center">
                  <span className="w-8 h-[1px] bg-marigold-500 mr-3"></span> Feedback
                </Link>
                <Link to="/complaint" className="text-lg font-medium tracking-wide uppercase text-kumkum-600 flex items-center">
                  <span className="w-8 h-[1px] bg-marigold-500 mr-3"></span> Complaint / Support
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
