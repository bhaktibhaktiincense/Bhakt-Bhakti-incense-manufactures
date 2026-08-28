import { useSEO } from '../hooks/useSEO';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Feedback() {
  useSEO({ title: "Share Your Feedback", description: "We value your experience with our incense products. Share your feedback with Bhakt & Bhakti Incense.", path: "/feedback" });

  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const contactInfo = formData.get('contact') as string;
    let email = null;
    let phone = null;
    
    if (contactInfo) {
      if (contactInfo.includes('@')) {
        email = contactInfo;
      } else {
        phone = contactInfo;
      }
    }
    
    const product = formData.get('product') as string;
    const message = formData.get('message') as string;
    const fullMessage = product ? `[Product: ${product}]\n${message}` : message;

    try {
      const { error } = await supabase.from('Feedback').insert([{
        name: formData.get('name'),
        phone: phone,
        email: email,
        rating: rating,
        message: fullMessage
      }]);

      if (error) {
        throw new Error(error.message || 'Database error occurred');
      }

      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      alert(`Submission failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-chai-50 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-lg shadow-xl text-center max-w-lg border-t-4 border-kumkum-600"
        >
          <div className="w-20 h-20 bg-marigold-100 rounded-full flex items-center justify-center mx-auto mb-6 text-marigold-600">
            <Star size={40} fill="currentColor" />
          </div>
          <h2 className="font-serif text-3xl text-espresso-900 mb-4">Thank You!</h2>
          <p className="text-espresso-700 leading-relaxed mb-8">
            Thank you for your valuable feedback. We appreciate your support.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="px-8 py-3 bg-kumkum-600 text-chai-50 font-bold uppercase tracking-widest hover:bg-kumkum-700 transition-colors text-sm rounded-sm"
          >
            Submit Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-chai-50">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-lg shadow-xl border-t-4 border-kumkum-600"
        >
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl text-espresso-900 mb-4">We Value Your Feedback</h1>
            <p className="text-espresso-700">
              Your feedback helps Bhakt & Bhakti Incense improve our products and services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Name <span className="text-espresso-500 font-normal lowercase tracking-normal">(optional)</span></label>
                <input type="text" name="name" className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-kumkum-500 focus:ring-1 focus:ring-kumkum-500 outline-none transition-all" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Mobile / Email <span className="text-espresso-500 font-normal lowercase tracking-normal">(optional)</span></label>
                <input type="text" name="contact" className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-kumkum-500 focus:ring-1 focus:ring-kumkum-500 outline-none transition-all" placeholder="Your Contact Detail" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Product / Fragrance</label>
              <select name="product" className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-kumkum-500 focus:ring-1 focus:ring-kumkum-500 outline-none transition-all">
                <option value="">Select a product...</option>
                <option value="Rajnigandha">Rajnigandha</option>
                <option value="Gulab">Gulab (Rose)</option>
                <option value="Mogra">Mogra</option>
                <option value="Sandalwood">Sandalwood</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Rating <span className="text-kumkum-600">*</span></label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      size={32} 
                      className={`${(hoverRating || rating) >= star ? 'text-marigold-500 fill-marigold-500' : 'text-chai-300'} transition-colors`} 
                    />
                  </button>
                ))}
              </div>
              {rating === 0 && <input type="hidden" required />}
            </div>

            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Feedback Message <span className="text-kumkum-600">*</span></label>
              <textarea name="message" required rows={5} className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-kumkum-500 focus:ring-1 focus:ring-kumkum-500 outline-none transition-all resize-none" placeholder="Please share your experience with us..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Photo <span className="text-espresso-500 font-normal lowercase tracking-normal">(optional)</span></label>
              <input type="file" accept="image/*" className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-kumkum-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:bg-chai-200 file:text-espresso-900 hover:file:bg-chai-300 transition-all" />
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isSubmitting || rating === 0} className="w-full py-4 bg-kumkum-600 text-chai-50 font-bold uppercase tracking-widest hover:bg-kumkum-700 transition-colors rounded-sm flex justify-center items-center disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
            
            <p className="text-xs text-center text-espresso-500 mt-4">
              * Note: Data is securely submitted directly to our database.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
