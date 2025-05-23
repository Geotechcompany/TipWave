import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import Image from "next/image";
import { Users, Globe, Award, Heart } from "lucide-react";

export default function About() {
  const stats = [
    { label: "Active DJs", value: "10,000+" },
    { label: "Partner Venues", value: "500+" },
    { label: "Countries", value: "25+" },
    { label: "Monthly Users", value: "1M+" }
  ];

  const values = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community First",
      description: "Building strong connections between DJs, venues, and music lovers."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Impact",
      description: "Transforming the entertainment industry worldwide."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Excellence",
      description: "Delivering the highest quality tools and experiences."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Passion",
      description: "Driven by our love for music and entertainment."
    }
  ];

  return (
    <PageLayout 
      title="About Us" 
      breadcrumbs={[{ label: "Company" }, { label: "About" }]}
    >
      <div className="space-y-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <Image
            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
            alt="Team"
            width={1200}
            height={400}
            className="object-cover w-full h-[400px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent flex items-center">
            <div className="p-8 max-w-2xl">
              <h2 className="text-4xl font-bold mb-4">Revolutionizing the Music Industry</h2>
              <p className="text-xl text-gray-300">
                We are on a mission to connect DJs, venues, and music lovers through 
                innovative technology and seamless experiences.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-blue-400 mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-400">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
} 