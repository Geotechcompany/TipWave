import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import { BookOpen, Search, Code, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Documentation() {
  const categories = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Getting Started",
      description: "Quick start guides and basic concepts",
      href: "/docs/getting-started"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "API Reference",
      description: "Complete API documentation",
      href: "/docs/api"
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      title: "Integration Guides",
      description: "Step-by-step integration tutorials",
      href: "/docs/integration"
    }
  ];

  return (
    <PageLayout 
      title="Documentation" 
      breadcrumbs={[{ label: "Resources" }, { label: "Documentation" }]}
    >
      <div className="space-y-12">
        {/* Search Section */}
        <div className="relative">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                type="search"
                placeholder="Search documentation..."
                className="pl-10 bg-gray-800/50"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <motion.a
              key={category.title}
              href={category.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="block p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-colors"
            >
              <div className="text-blue-400 mb-4">{category.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
              <p className="text-gray-400">{category.description}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </PageLayout>
  );
} 