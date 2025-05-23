import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, BarChart3 as ChartBar, Music2, Shield, Users, Wallet, Star, Zap, CheckCircle, Globe, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForDJs() {
  const features = [
    {
      icon: <Music2 className="h-6 w-6" />,
      title: "Smart Music Library",
      description: "Organize your tracks with AI-powered tagging and smart playlists. Never lose track of your music again."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Audience Interaction",
      description: "Real-time song requests, audience feedback, and crowd engagement tools to keep the party going."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Gig Management",
      description: "Handle bookings, schedules, and venue communications all in one place. Stay organized and professional."
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Get paid faster with integrated payment processing and automated invoicing for your gigs."
    },
    {
      icon: <ChartBar className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Track your most popular songs, audience demographics, and earnings with detailed analytics."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Copyright Protection",
      description: "Stay compliant with built-in licensing tracking and royalty management tools."
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-green-400" />,
      title: "Increase Your Bookings",
      description: "DJs using TipWave report a 40% increase in booking requests within the first 3 months."
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      title: "Save 10+ Hours Weekly",
      description: "Automate administrative tasks and focus on what matters most—your music and performances."
    },
    {
      icon: <Award className="h-6 w-6 text-purple-400" />,
      title: "Build Your Reputation",
      description: "Verified reviews and ratings help you stand out in a competitive market."
    },
    {
      icon: <Globe className="h-6 w-6 text-blue-400" />,
      title: "Expand Your Reach",
      description: "Connect with venues and audiences beyond your local scene through our global network."
    }
  ];

  const testimonials = [
    {
      name: "Alex Rodriguez",
      role: "Club DJ, Miami",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "TipWave transformed my career. I've doubled my bookings and the audience engagement features have completely changed how I interact with crowds."
    },
    {
      name: "Sarah Chen",
      role: "Wedding DJ, Los Angeles",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "The song request system is a game-changer for weddings. Couples love that their guests can participate, and I love the organized playlist management."
    },
    {
      name: "Marcus Johnson",
      role: "Festival DJ, Berlin",
      image: "https://randomuser.me/api/portraits/men/68.jpg",
      quote: "As someone who plays international festivals, the analytics help me understand different markets and adapt my sets. The payment system is also incredibly reliable."
    }
  ];

  return (
    <PageLayout 
      title="For DJs" 
      breadcrumbs={[{ label: "Product" }, { label: "For DJs" }]}
    >
      <div className="space-y-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <Image
            src="https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg"
            alt="DJ Performing"
            width={1200}
            height={500}
            className="object-cover w-full h-[500px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent flex items-center">
            <div className="p-8 max-w-2xl">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
              >
                Take Your DJ Career to the Next Level
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-300 mb-6"
              >
                Professional tools and features designed specifically for DJs to manage their music, 
                engage with audiences, and grow their business.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" className="border-blue-500/50 hover:bg-blue-500/10">
                  Watch Demo
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10,000+", label: "Active DJs" },
            { value: "40%", label: "Booking Increase" },
            { value: "2M+", label: "Song Requests" },
            { value: "$12M+", label: "DJ Earnings" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-12 text-center"
          >
            Powerful Tools for Modern DJs
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-10"
        >
          <div className="absolute inset-0 opacity-10">
            <Image
              src="https://cdn.pixabay.com/photo/2015/01/20/13/13/ipad-605439_1280.jpg"
              alt="DJ Equipment"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-10 text-center">How TipWave Works for DJs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Create Your Profile",
                  description: "Set up your professional DJ profile with your bio, music style, and portfolio."
                },
                {
                  step: "2",
                  title: "Connect With Venues",
                  description: "Browse venue listings or get discovered by venues looking for your specific style."
                },
                {
                  step: "3",
                  title: "Manage & Perform",
                  description: "Use our tools to manage bookings, engage audiences, and get paid securely."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (index * 0.2) }}
                  className="relative"
                >
                  <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                  <div className="bg-gray-800/70 rounded-xl p-6 pt-10 h-full">
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-4 text-center"
          >
            Real Benefits for Your Career
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-center max-w-3xl mx-auto mb-12"
          >
            TipWave isn&apos;t just another platform—it&apos;s a career accelerator designed by DJs, for DJs.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-6 flex items-start gap-4"
              >
                <div className="bg-gray-700/50 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800/50 via-blue-900/20 to-purple-900/20 rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">What DJs Say About Us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="bg-gray-800/70 rounded-xl p-6 relative"
              >
                <div className="absolute -top-5 -right-5">
                  <div className="text-yellow-400">
                    <Star className="w-10 h-10 fill-current" />
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={60}
                    height={60}
                    className="rounded-full object-cover h-[60px]"
                  />
                  <div className="ml-3">
                    <h4 className="font-medium text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured DJ Success Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          <div>
            <Image
              src="https://cdn.pixabay.com/photo/2014/05/21/15/18/musician-349790_1280.jpg"
              alt="DJ Success Story"
              width={600}
              height={400}
              className="rounded-xl object-cover"
            />
          </div>
          <div className="p-8 max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="https://randomuser.me/api/portraits/men/92.jpg"
                alt="DJ Michael"
                width={80}
                height={80}
                className="rounded-full border-2 border-blue-400"
              />
              <div>
                <h3 className="text-2xl font-bold">DJ Michael&apos;s Story</h3>
                <p className="text-blue-400">From Local Bars to International Festivals</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg">
              &quot;Before TipWave, I was struggling to get consistent bookings. Within 6 months of joining, 
              I&apos;ve performed at major venues across Europe and doubled my income. The platform&apos;s 
              networking features and professional tools made all the difference.&quot;
            </p>
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
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
          <h2 className="text-3xl font-bold mb-4">Affordable Plans for Every DJ</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            From beginners to professionals, we have pricing options that grow with your career.
            Start free and upgrade as you expand.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                features: ["Basic profile", "5 gig listings", "Song request system", "Limited analytics"]
              },
              {
                name: "Professional",
                price: "$19/mo",
                popular: true,
                features: ["Enhanced profile", "Unlimited gigs", "Full audience engagement", "Complete analytics", "Payment processing"]
              },
              {
                name: "Business",
                price: "$49/mo",
                features: ["Multiple DJ profiles", "Agency tools", "Priority support", "Custom branding", "API access"]
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className={`rounded-xl p-6 relative ${
                  plan.popular 
                    ? "bg-gradient-to-b from-blue-600/20 to-purple-600/20 border border-blue-500/30" 
                    : "bg-gray-800"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mt-4">{plan.name}</h3>
                <div className="my-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
                <ul className="text-left space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={plan.popular ? "bg-blue-600 hover:bg-blue-700 w-full" : "bg-gray-700 hover:bg-gray-600 w-full"}
                >
                  Choose Plan
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-2xl p-10 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your DJ Career?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of DJs who are growing their careers, connecting with new venues,
            and creating unforgettable experiences for their audiences.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Sign Up Free
            </Button>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-gray-400">No credit card required. Free 14-day trial on all paid plans.</p>
        </motion.div>
      </div>
    </PageLayout>
  );
} 