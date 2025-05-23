import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import { Search, HelpCircle, Book, MessageCircle, Zap, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Support() {
  const categories = [
    {
      icon: <Book />,
      title: "Getting Started",
      articles: [
        "Setting up your DJ profile",
        "Connecting payment methods",
        "Managing your music library"
      ]
    },
    {
      icon: <MessageCircle />,
      title: "Common Issues",
      articles: [
        "Troubleshooting audio problems",
        "Payment processing issues",
        "Account access and security"
      ]
    },
    {
      icon: <Zap />,
      title: "Quick Solutions",
      articles: [
        "Reset your password",
        "Update billing information",
        "Contact support team"
      ]
    }
  ];

  return (
    <PageLayout 
      title="Support Center" 
      breadcrumbs={[{ label: "Resources" }, { label: "Support" }]}
    >
      <div className="space-y-12">
        {/* Search Section */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Search for help articles..." 
            className="pl-12 bg-gray-800 border-gray-700 py-6 text-lg"
          />
        </div>

        {/* Quick Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center"
        >
          <HelpCircle className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Need Immediate Help?</h2>
          <p className="text-gray-200 mb-6">
            Our support team is available 24/7 to assist you with any issues.
          </p>
          <Button variant="secondary" size="lg">
            Start Live Chat
          </Button>
        </motion.div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-blue-400 mb-4">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
              <ul className="space-y-3">
                {category.articles.map((article, i) => (
                  <li key={i}>
                    <a 
                      href="#" 
                      className="flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {article}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-800/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Add FAQ items here */}
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 