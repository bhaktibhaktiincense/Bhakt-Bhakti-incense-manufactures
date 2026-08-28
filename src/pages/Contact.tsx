import { useSEO } from '../hooks/useSEO';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  useSEO({ title: "Contact Us", description: "Get in touch with Bhakt & Bhakti Incense for wholesale inquiries, support, or general questions about our products.", path: "/contact" });

  const [searchParams] = useSearchParams();
  const productParam = searchParams.get('product');
  const defaultSubject = productParam ? `Product Enquiry - ${productParam}` : '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [isB2BSubmitting, setIsB2BSubmitting] = useState(false);
  const [b2bSubmitSuccess, setB2BSubmitSuccess] = useState(false);

  const handleB2BSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsB2BSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from('Product_Enquiries').insert([{
        name: `${formData.get('businessName')} - ${formData.get('contactPerson')}`,
        phone: formData.get('phone'),
        email: null,
        product_name: `B2B - ${formData.get('businessType')}`,
        message: formData.get('message'),
        status: 'New'
      }]);

      if (error) {
        throw new Error(error.message || 'Database error occurred');
      }

      setB2BSubmitSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setB2BSubmitSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error submitting B2B enquiry:', error);
      alert(`Submission failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsB2BSubmitting(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from('Product_Enquiries').insert([{
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email') || null,
        product_name: formData.get('subject'),
        message: formData.get('message'),
        status: 'New'
      }]);

      if (error) {
        throw new Error(error.message || 'Database error occurred');
      }

      setSubmitSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error submitting enquiry:', error);
      alert(`Submission failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 bg-chai-50 min-h-screen">
      <section className="bg-espresso-900 py-20 text-chai-50 text-center px-6 relative border-b-4 border-kumkum-600">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
        <div className="relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-marigold-400">Get in Touch</h1>
          <p className="text-chai-200 tracking-wide max-w-2xl mx-auto">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 lg:px-12 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-16">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-12">
            <div>
              <h2 className="font-serif text-3xl text-kumkum-600 mb-6 flex items-center">
                <span className="w-8 h-[2px] bg-marigold-500 mr-3"></span> Details
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 text-espresso-800">
                  <MapPin className="text-marigold-500 mt-1 shrink-0" />
                  <div>
                    <strong className="block text-espresso-900 mb-1">Office & Factory</strong>
                    046 Madhura pur, malikpura,<br />
                    Goraul, Vaishali, Bihar 844118
                  </div>
                </div>
                <div className="flex items-start space-x-4 text-espresso-800">
                  <Phone className="text-marigold-500 mt-1 shrink-0" />
                  <div>
                    <strong className="block text-espresso-900 mb-1">Phone & WhatsApp</strong>
                    +91 7323059651
                  </div>
                </div>
                <div className="flex items-start space-x-4 text-espresso-800">
                  <Mail className="text-marigold-500 mt-1 shrink-0" />
                  <div>
                    <strong className="block text-espresso-900 mb-1">Email</strong>
                    bbincensemanufacters@gmail.com
                  </div>
                </div>
                <div className="flex items-start space-x-4 text-espresso-800">
                  <Clock className="text-marigold-500 mt-1 shrink-0" />
                  <div>
                    <strong className="block text-espresso-900 mb-1">Business Hours</strong>
                    Mon - Sat: 9:00 AM - 6:00 PM<br/>
                    Sun: Closed
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-marigold-500/30">
              <h2 className="font-serif text-2xl text-espresso-900 mb-6">Quick Actions</h2>
              <div className="flex flex-col space-y-3">
                <a href="tel:+917323059651" className="w-full py-3 bg-espresso-900 text-chai-50 font-medium tracking-wide uppercase text-sm hover:bg-kumkum-600 transition-colors text-center block">Call Now</a>
                <a href="https://wa.me/917323059651" target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#25D366] text-white font-medium tracking-wide uppercase text-sm hover:bg-[#128C7E] transition-colors text-center block">WhatsApp Us</a>
                <a href="mailto:bbincensemanufacters@gmail.com" className="w-full py-3 border-2 border-espresso-900 text-espresso-900 font-medium tracking-wide uppercase text-sm hover:bg-chai-100 transition-colors text-center block">Email Us</a>
              </div>
            </div>
          </div>

          {/* Contact Forms */}
          <div className="lg:col-span-2 space-y-16">
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-chai-100 p-8 md:p-10 rounded-tl-3xl rounded-br-3xl border border-marigold-500/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-marigold-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
              
              <h2 className="font-serif text-4xl text-espresso-900 mb-8 relative z-10">Send an Enquiry</h2>
              {submitSuccess ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative z-10 flex items-center mb-6" role="alert">
                  <CheckCircle2 className="mr-3" />
                  <span className="block sm:inline">Thank you for your enquiry. We will get back to you soon.</span>
                </div>
              ) : null}
              <form onSubmit={handleEnquirySubmit} className="space-y-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-espresso-800 mb-2">Name *</label>
                    <input type="text" name="name" className="w-full border border-chai-200 bg-white p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-espresso-800 mb-2">Phone / WhatsApp *</label>
                    <input type="tel" name="phone" className="w-full border border-chai-200 bg-white p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso-800 mb-2">Email Address</label>
                  <input type="email" name="email" className="w-full border border-chai-200 bg-white p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso-800 mb-2">Subject</label>
                  <input type="text" name="subject" defaultValue={defaultSubject} className="w-full border border-chai-200 bg-white p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso-800 mb-2">Message *</label>
                  <textarea name="message" rows={4} className="w-full border border-chai-200 bg-white p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none" required></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-kumkum-600 text-chai-50 font-medium tracking-widest uppercase text-sm hover:bg-kumkum-700 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                </button>
              </form>
            </motion.div>

            <motion.div id="b2b" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-espresso-900 p-8 md:p-10 rounded-tr-3xl rounded-bl-3xl text-chai-50 shadow-md border-2 border-marigold-500/20 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              }} />
              
              <div className="relative z-10">
                <h2 className="font-serif text-4xl mb-3 text-marigold-400">Partner With Us</h2>
                <p className="text-chai-200 mb-8 text-lg font-light">For Wholesalers, Distributors, Retailers, and Corporate buyers.</p>
                
                {b2bSubmitSuccess ? (
                  <div className="bg-green-800/30 border border-green-500/50 text-green-200 px-4 py-3 rounded relative z-10 flex items-center mb-6" role="alert">
                    <CheckCircle2 className="mr-3 text-green-400" />
                    <span className="block sm:inline">Thank you for your business enquiry. We will get back to you soon.</span>
                  </div>
                ) : null}
                
                <form onSubmit={handleB2BSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-chai-200 mb-2">Business Name *</label>
                      <input type="text" name="businessName" className="w-full bg-espresso-800 border border-espresso-700 p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none text-white" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-chai-200 mb-2">Contact Person *</label>
                      <input type="text" name="contactPerson" className="w-full bg-espresso-800 border border-espresso-700 p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none text-white" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-chai-200 mb-2">Phone *</label>
                      <input type="tel" name="phone" className="w-full bg-espresso-800 border border-espresso-700 p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none text-white" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-chai-200 mb-2">Business Type *</label>
                      <select name="businessType" className="w-full bg-espresso-800 border border-espresso-700 p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none text-white appearance-none" required>
                        <option value="">Select Type</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Distributor">Distributor</option>
                        <option value="Retailer">Retailer</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-chai-200 mb-2">Approximate Requirement / Message</label>
                    <textarea name="message" rows={3} className="w-full bg-espresso-800 border border-espresso-700 p-3 rounded-sm focus:ring-1 focus:ring-marigold-500 focus:border-marigold-500 outline-none text-white"></textarea>
                  </div>
                  <button type="submit" disabled={isB2BSubmitting} className="px-8 py-3.5 bg-marigold-500 text-espresso-900 font-bold tracking-widest uppercase text-sm hover:bg-marigold-400 transition-colors disabled:opacity-50">
                    {isB2BSubmitting ? 'Sending...' : 'Submit Business Enquiry'}
                  </button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
