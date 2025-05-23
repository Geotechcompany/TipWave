import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import Image from "next/image";
import { Users, MessageSquare, Star, Trophy,  Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Community() {
  const highlights = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "10,000+ Members",
      description: "Join a thriving community of DJs and music enthusiasts"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Active Discussions",
      description: "Engage in conversations about music, tech, and industry trends"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Expert Advice",
      description: "Learn from experienced professionals in the field"
    }
  ];

  const featuredMembers = [
    {
      name: "DJ Alex",
      role: "Tech House Pioneer",
      avatar: "https://ui-avatars.com/api/?name=DJ+Alex",
      contributions: "250+ posts"
    },
    {
      name: "Sarah Beats",
      role: "Community Leader",
      avatar: "https://ui-avatars.com/api/?name=Sarah+B",
      contributions: "500+ helps"
    }
    // Add more members...
  ];

  return (
    <PageLayout 
      title="Community" 
      breadcrumbs={[{ label: "Resources" }, { label: "Community" }]}
    >
      <div className="space-y-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-6">Join Our Global DJ Community</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Connect with fellow DJs, share experiences, and grow together in the world&apos;s 
            largest community of music professionals.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Join Community
          </Button>
        </motion.div>

        {/* Community Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-6 text-center"
            >
              <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-4">
                {highlight.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{highlight.title}</h3>
              <p className="text-gray-400">{highlight.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Featured Members */}
        <div className="bg-gray-800/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Featured Community Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-4 text-center"
              >
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{member.role}</p>
                <p className="text-sm text-blue-400">{member.contributions}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Community Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 rounded-xl p-6"
          >
            <Trophy className="h-8 w-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Monthly Challenges</h3>
            <p className="text-gray-400 mb-4">
              Participate in our monthly DJ challenges and showcase your skills to the community.
            </p>
            <Button variant="outline">View Challenges</Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 rounded-xl p-6"
          >
            <Share2 className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Resource Sharing</h3>
            <p className="text-gray-400 mb-4">
              Share and discover valuable resources, from music tracks to DJ techniques.
            </p>
            <Button variant="outline">Browse Resources</Button>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
} 