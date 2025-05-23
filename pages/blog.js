import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Blog() {
  const featuredPost = {
    title: "The Future of DJ Technology in 2024",
    excerpt: "Discover the latest trends and innovations shaping the future of DJ technology...",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
    author: "DJ Tech Team",
    date: "March 1, 2024",
    readTime: "5 min read"
  };

  const posts = [
    {
      title: "Top 10 Music Management Tips for DJs",
      excerpt: "Learn how to organize and manage your growing music collection effectively...",
      category: "Tips & Tricks",
      date: "February 28, 2024",
      readTime: "4 min read"
    },
    {
      title: "Building Your DJ Brand Online",
      excerpt: "Essential strategies for creating a strong online presence and growing your audience...",
      category: "Marketing",
      date: "February 25, 2024",
      readTime: "6 min read"
    }
    // Add more posts...
  ];

  return (
    <PageLayout 
      title="Blog" 
      breadcrumbs={[{ label: "Resources" }, { label: "Blog" }]}
    >
      <div className="space-y-12">
        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <Image
            src={featuredPost.image}
            alt={featuredPost.title}
            width={1200}
            height={500}
            className="object-cover w-full h-[500px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent flex items-end">
            <div className="p-8">
              <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {featuredPost.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {featuredPost.readTime}
                </span>
              </div>
              <h2 className="text-4xl font-bold mb-4">{featuredPost.title}</h2>
              <p className="text-xl text-gray-300 mb-6">{featuredPost.excerpt}</p>
              <Button>Read More</Button>
            </div>
          </div>
        </motion.div>

        {/* Latest Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="text-sm text-blue-400 mb-2">{post.category}</div>
                <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
                <p className="text-gray-400 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </PageLayout>
  );
} 