import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-espresso-900 text-chai-100 pt-20 pb-10 relative overflow-hidden border-t-4 border-kumkum-600">
      <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-widest text-marigold-400 uppercase mb-1">
                Bhakt & Bhakti
              </h2>
              <span className="text-xs tracking-[0.3em] text-chai-200 uppercase">
                Incense
              </span>
            </div>
            <p className="text-sm text-chai-200 leading-relaxed max-w-sm">
              Crafting Fragrance, Creating Devotion. Premium incense sticks crafted with care, quality fragrances and a commitment to creating a beautiful experience.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-marigold-500/30 flex items-center justify-center text-marigold-400 hover:bg-marigold-500 hover:text-espresso-900 transition-colors"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-marigold-500/30 flex items-center justify-center text-marigold-400 hover:bg-marigold-500 hover:text-espresso-900 transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-marigold-500/30 flex items-center justify-center text-marigold-400 hover:bg-marigold-500 hover:text-espresso-900 transition-colors"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl text-chai-50 mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3 text-sm text-chai-200">
              <li><Link to="/" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> Home</Link></li>
              <li><Link to="/about" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> About Us</Link></li>
              <li><Link to="/products" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> Products</Link></li>
              <li><Link to="/manufacturing" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> Manufacturing</Link></li>
              <li><Link to="/quality" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> Quality</Link></li>
              <li><Link to="/gallery" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-serif text-xl text-chai-50 mb-6 uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm text-chai-200">
              <li><Link to="/feedback" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> Submit Feedback</Link></li>
              <li><Link to="/complaint" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> Raise Complaint</Link></li>
              <li><Link to="/contact" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> Product Enquiry</Link></li>
              <li><Link to="/contact#b2b" className="hover:text-marigold-400 transition-colors flex items-center"><span className="w-2 h-[1px] bg-marigold-500 mr-2"></span> B2B Enquiry</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-xl text-chai-50 mb-6 uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-4 text-sm text-chai-200">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-marigold-500 mt-0.5 shrink-0" />
                <span>046 Madhura pur, malikpura,<br/>Goraul, Vaishali, Bihar 844118</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-marigold-500 shrink-0" />
                <span>+91 7323059651</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-marigold-500 shrink-0" />
                <span>bbincensemanufacters@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-espresso-700 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-chai-200">
          <p>© 2026 Bhakt & Bhakti Incense. All Rights Reserved.</p>
          <div className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-marigold-400">Privacy Policy</Link>
            <Link to="#" className="hover:text-marigold-400">Terms & Conditions</Link>
            <Link to="#" className="hover:text-marigold-400">Shipping Policy</Link>
            <Link to="#" className="hover:text-marigold-400">Return/Refund Policy</Link>
            <Link to="/admin" className="hover:text-marigold-400 font-medium">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

