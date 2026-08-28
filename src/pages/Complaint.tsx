import { useSEO } from '../hooks/useSEO';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Complaint() {
  useSEO({ title: "File a Complaint", description: "Have an issue with your order or product? File a complaint and our support team will assist you promptly.", path: "/complaint" });

  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Indian Mobile Validation (10 digits starting with 6-9)
    const mobile = formData.get('mobile') as string;
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      setMobileError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setMobileError('');
    setIsSubmitting(true);

    const newRef = `BB-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const product = formData.get('product') as string;
    const complaintType = formData.get('complaintType') as string;
    const orderNumber = formData.get('orderNumber') as string;
    
    const subject = `${complaintType}${product ? ` - ${product}` : ''}${orderNumber ? ` (Order: ${orderNumber})` : ''}`;

    try {
      const { error } = await supabase
        .from('complaints')
        .insert([
          {
            name: formData.get('name'),
            phone: mobile,
            email: formData.get('email') || null,
            subject: subject,
            message: formData.get('description'),
            status: 'New'
          }
        ]);

      if (error) {
        throw new Error(error.message || 'Database error occurred');
      }
      
      setRefNumber(newRef);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
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
          className="bg-white p-12 rounded-lg shadow-xl text-center max-w-lg border-t-4 border-marigold-500"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="font-serif text-3xl text-espresso-900 mb-4">Complaint Registered</h2>
          <p className="text-espresso-700 leading-relaxed mb-2">
            Your complaint has been registered successfully.
          </p>
          <div className="bg-chai-100 py-4 px-6 rounded-md inline-block mb-8 border border-chai-200">
            <p className="text-sm uppercase tracking-widest text-espresso-600 mb-1">Complaint Reference</p>
            <p className="font-bold text-xl text-espresso-900">{refNumber}</p>
          </div>
          <button 
            onClick={() => {
              setSubmitted(false);
              setRefNumber('');
            }}
            className="block w-full py-3 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest hover:bg-marigold-400 transition-colors text-sm rounded-sm"
          >
            Register Another
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
          className="bg-white p-8 md:p-12 rounded-lg shadow-xl border-t-4 border-marigold-500"
        >
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl text-espresso-900 mb-4">We're Here to Help</h1>
            <p className="text-espresso-700">
              If you have any issue with our product or service, please tell us and our team will look into it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Customer Name <span className="text-kumkum-600">*</span></label>
                <input type="text" name="name" required className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none transition-all" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Mobile Number <span className="text-kumkum-600">*</span></label>
                <input type="tel" name="mobile" required className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none transition-all" placeholder="10-digit Mobile No." />
                {mobileError && <p className="text-kumkum-600 text-xs mt-2">{mobileError}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Email Address <span className="text-espresso-500 font-normal lowercase tracking-normal">(optional)</span></label>
              <input type="email" name="email" className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none transition-all" placeholder="your.email@example.com" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Product / Fragrance</label>
                <select name="product" className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none transition-all">
                  <option value="">Select a product...</option>
                  <option value="Rajnigandha">Rajnigandha</option>
                  <option value="Gulab">Gulab (Rose)</option>
                  <option value="Mogra">Mogra</option>
                  <option value="Sandalwood">Sandalwood</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Complaint Type <span className="text-kumkum-600">*</span></label>
                <select name="complaintType" required className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none transition-all">
                  <option value="">Select issue type...</option>
                  <option value="Product Quality">Product Quality</option>
                  <option value="Fragrance Issue">Fragrance Issue</option>
                  <option value="Packaging Issue">Packaging Issue</option>
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Missing/Different Product">Missing/Different Product</option>
                  <option value="Delivery Issue">Delivery Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Order / Batch Number <span className="text-espresso-500 font-normal lowercase tracking-normal">(optional)</span></label>
              <input type="text" name="orderNumber" className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none transition-all" placeholder="If available on packaging" />
            </div>

            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Complaint Description <span className="text-kumkum-600">*</span></label>
              <textarea name="description" required rows={5} className="w-full p-4 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none transition-all resize-none" placeholder="Please describe the issue in detail..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Photo Evidence <span className="text-espresso-500 font-normal lowercase tracking-normal">(optional)</span></label>
              <input type="file" accept="image/*" className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:bg-chai-200 file:text-espresso-900 hover:file:bg-chai-300 transition-all" />
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest hover:bg-marigold-400 transition-colors rounded-sm flex justify-center items-center disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
            
            <p className="text-xs text-center text-espresso-500 mt-4">
              * Note: Information is securely submitted directly to our support team.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
