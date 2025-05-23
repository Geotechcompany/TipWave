import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Building2, 
  Music2, 
  Users, 
  Calendar, 
  BarChart3 as ChartBar, 
  CreditCard, 
  Clock,
  Star,
  CheckCircle,
  Shield,
  
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForVenues() {
  const features = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Venue Management",
      description: "Streamline your venue operations with integrated booking, scheduling, and staff management tools."
    },
    {
      icon: <Music2 className="h-6 w-6" />,
      title: "DJ Directory",
      description: "Access our curated network of professional DJs. Find the perfect match for your venue's style."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Customer Experience",
      description: "Enhance guest satisfaction with interactive music requests and real-time feedback systems."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Event Planning",
      description: "Coordinate events effortlessly with our comprehensive event management platform."
    },
    {
      icon: <ChartBar className="h-6 w-6" />,
      title: "Performance Insights",
      description: "Track attendance, popular music trends, and revenue with detailed analytics dashboards."
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Payment Solutions",
      description: "Handle DJ payments, tickets, and cover charges with our secure payment processing."
    }
  ];

  const benefits = [
    {
      title: "Increased Revenue",
      description: "On average, venues see a 25% increase in customer satisfaction and repeat visits.",
      icon: <ChartBar className="h-6 w-6 text-green-400" />
    },
    {
      title: "Time Saved",
      description: "Reduce administrative work by 75% with automated booking and management.",
      icon: <Clock className="h-6 w-6 text-blue-400" />
    },
    {
      title: "Better Entertainment",
      description: "Access to top DJ talent and music management tools for exceptional experiences.",
      icon: <Music2 className="h-6 w-6 text-purple-400" />
    },
    {
      title: "Enhanced Security",
      description: "Protect your venue with advanced payment verification and booking confirmation.",
      icon: <Shield className="h-6 w-6 text-red-400" />
    }
  ];

  const testimonials = [
    {
      name: "Emma Rodriguez",
      role: "Club Manager, New York",
      image: "https://randomuser.me/api/portraits/women/23.jpg",
      quote: "TipWave has revolutionized how we manage our entertainment. We've seen a 30% increase in customer retention since implementing the platform."
    },
    {
      name: "James Wilson",
      role: "Event Director, Chicago",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
      quote: "Finding quality DJs used to be our biggest challenge. Now we have access to verified professionals who consistently deliver amazing experiences."
    },
    {
      name: "Sophia Chen",
      role: "Lounge Owner, Los Angeles",
      image: "https://randomuser.me/api/portraits/women/79.jpg",
      quote: "The audience engagement features have transformed our venue. Guests love the interactive experience, and we love the increased bar sales!"
    }
  ];

  return (
    <PageLayout 
      title="For Venues" 
      breadcrumbs={[{ label: "Product" }, { label: "For Venues" }]}
    >
      <div className="space-y-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <Image
            src="https://cdn.pixabay.com/photo/2016/11/18/15/40/audience-1835431_1280.jpg"
            alt="Nightclub Venue"
            width={1200}
            height={400}
            className="object-cover w-full h-[400px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent flex items-center">
            <div className="p-8 max-w-2xl">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
              >
                Transform Your Venue&apos;s Entertainment
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-300 mb-6"
              >
                Elevate your venue&apos;s experience with professional DJ management, 
                audience engagement, and powerful analytics tools.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Partner With Us
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                  View Demo
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { value: "500+", label: "Venues Worldwide" },
            { value: "35%", label: "Average Revenue Increase" },
            { value: "5,000+", label: "Professional DJs" },
            { value: "1M+", label: "Happy Customers" }
          ].map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Comprehensive Venue Solutions</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to manage entertainment, engage customers, and grow your business.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-colors"
              >
                <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-purple-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-10"
        >
          <div className="absolute inset-0 opacity-10">
            <Image
              src="https://cdn.pixabay.com/photo/2015/01/16/15/00/concert-601537_1280.jpg"
              alt="Venue Interior"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-10 text-center">How TipWave Works for Venues</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Create Your Venue Profile",
                  description: "Set up your venue profile with details, photos, and entertainment requirements."
                },
                {
                  step: "2",
                  title: "Connect With Top DJs",
                  description: "Browse our network of professional DJs or let them apply to your venue listings."
                },
                {
                  step: "3",
                  title: "Manage & Analyze",
                  description: "Use our tools to manage bookings, engage audiences, and track performance metrics."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Real Benefits for Your Business</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              TipWave delivers measurable improvements to your venue&apos;s operations and bottom line.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6"
              >
                <div className="mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Testimonials */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Trusted by Venues Worldwide</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Hear from venue owners and managers who have transformed their entertainment experience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <p className="text-purple-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 italic">&quot;{testimonial.quote}&quot;</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Success Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          <div>
            <Image
              src="https://cdn.pixabay.com/photo/2016/11/22/19/15/audience-1850119_1280.jpg"
              alt="Venue Success Story"
              width={600}
              height={400}
              className="rounded-xl object-cover"
            />
          </div>
          <div className="p-8 max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="https://randomuser.me/api/portraits/women/65.jpg"
                alt="Lisa Thompson"
                width={80}
                height={80}
                className="rounded-full border-2 border-purple-400"
              />
              <div>
                <h3 className="text-2xl font-bold">Lisa&apos;s Nightclub Story</h3>
                <p className="text-purple-400">From Struggling Venue to City Hotspot</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg">
              &quot;Before TipWave, we struggled with inconsistent entertainment quality and low customer retention. 
              Within 3 months of implementing the platform, we&apos;ve become the most talked-about venue in the city. 
              Our revenue has increased by 45%, and we&apos;ve built a loyal customer base that returns week after week.&quot;
            </p>
            <Button className="mt-6 bg-purple-600 hover:bg-purple-700">
              Read Full Story
            </Button>
          </div>
        </motion.div>

        {/* Pricing Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-2xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Flexible Plans for Every Venue</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            From small bars to large nightclubs, we have pricing options that scale with your business.
            Start with a free trial and upgrade as you grow.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Basic",
                price: "$99/mo",
                features: ["Venue profile", "DJ discovery", "Basic analytics", "Email support"]
              },
              {
                name: "Professional",
                price: "$199/mo",
                popular: true,
                features: ["Enhanced profile", "Priority DJ matching", "Advanced analytics", "Audience engagement tools", "Priority support"]
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: ["Multiple venue management", "VIP DJ network access", "Custom integrations", "Dedicated account manager", "24/7 support"]
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl p-6 border ${
                  plan.popular 
                    ? "border-purple-500 bg-gradient-to-b from-purple-900/20 to-gray-900" 
                    : "border-gray-700 bg-gray-900/50"
                }`}
              >
                {plan.popular && (
                  <div className="bg-purple-600 text-white text-sm font-medium py-1 px-3 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4">{plan.price}</div>
                <ul className="space-y-3 text-left mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={plan.popular ? "bg-purple-600 hover:bg-purple-700 w-full" : "bg-gray-700 hover:bg-gray-600 w-full"}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-10 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Venue?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join hundreds of successful venues that have elevated their entertainment experience
            and increased their revenue with TipWave.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Partner With Us
            </Button>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-gray-400">No commitment required. Free 30-day trial on all plans.</p>
        </motion.div>
      </div>
    </PageLayout>
  );
} 