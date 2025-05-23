import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from 'next/link';

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      // Reset form after successful submission
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5 text-blue-400" />,
      title: "Email Us",
      details: "support@tipwave.com",
      action: "mailto:support@tipwave.com"
    },
    {
      icon: <Phone className="h-5 w-5 text-green-400" />,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: <MapPin className="h-5 w-5 text-red-400" />,
      title: "Visit Us",
      details: "123 Music Avenue, San Francisco, CA 94107",
      action: "https://maps.google.com/?q=San+Francisco"
    },
    {
      icon: <Clock className="h-5 w-5 text-yellow-400" />,
      title: "Business Hours",
      details: "Monday-Friday: 9AM-6PM PST",
      action: null
    }
  ].map((item, index) => (
    <div key={index} className="flex items-start gap-4">
      <div className="bg-gray-800/50 p-3 rounded-lg">{item.icon}</div>
      <div>
        <h3 className="font-medium mb-1">{item.title}</h3>
        <div className="text-gray-400">
          {item.action ? (
            <Link href={item.action} className="hover:text-white transition-colors">
              {item.details}
            </Link>
          ) : (
            item.details
          )}
        </div>
      </div>
    </div>
  ));

  return (
    <PageLayout 
      title="Contact Us" 
      breadcrumbs={[{ label: "Company" }, { label: "Contact" }]}
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-300">
            Have questions about TipWave? We&apos;re here to help you with anything you need.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {contactInfo}
        </motion.div>

        {/* Contact Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-gray-800/30 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            
            {submitStatus === "success" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400"
              >
                Thank you for your message! We&apos;ll get back to you soon.
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="bg-gray-800/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                  className="bg-gray-800/50"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                  className="bg-gray-800/50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
              <ul className="space-y-4 text-gray-300">
                <li>
                  <strong className="block text-white">How do I sign up as a DJ?</strong>
                  <span className="text-sm">Visit our DJ registration page and follow the simple steps.</span>
                </li>
                <li>
                  <strong className="block text-white">What payment methods do you accept?</strong>
                  <span className="text-sm">We accept all major credit cards, PayPal, and crypto payments.</span>
                </li>
                <li>
                  <strong className="block text-white">How do I connect my venue?</strong>
                  <span className="text-sm">Register as a venue owner and follow our venue setup guide.</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/support" className="text-blue-400 hover:text-blue-300 transition-colors">
                  View all FAQs →
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Join Our Community</h3>
              <p className="text-gray-400 mb-4">
                Connect with other DJs and venue owners in our thriving community.
              </p>
              <Link 
                href="/community" 
                className="inline-block px-4 py-2 bg-white/10 hover:bg-white/15 transition-colors rounded-lg text-white"
              >
                Join Community
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
} 