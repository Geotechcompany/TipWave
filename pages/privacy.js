import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      icon: <Shield />,
      title: "Data Protection",
      content: "We implement industry-standard security measures to protect your personal information."
    },
    {
      icon: <Lock />,
      title: "Information Collection",
      content: "We collect only essential information needed to provide our services and improve your experience."
    },
    {
      icon: <Eye />,
      title: "Data Usage",
      content: "Your data is used solely for service provision and platform improvement, never sold to third parties."
    },
    {
      icon: <UserCheck />,
      title: "Your Rights",
      content: "You have full control over your data with rights to access, modify, or delete your information."
    }
  ];

  return (
    <PageLayout 
      title="Privacy Policy" 
      breadcrumbs={[{ label: "Company" }, { label: "Privacy" }]}
    >
      <div className="space-y-12">
        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-300">
            We are committed to protecting your privacy and ensuring the security of your personal information.
            This policy outlines how we collect, use, and protect your data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-6"
            >
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-blue-400 mb-4">
                {section.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
              <p className="text-gray-400">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Privacy Policy */}
        <div className="prose prose-invert max-w-none">
          <h2>Detailed Privacy Policy</h2>
          {/* Add your detailed privacy policy sections here */}
        </div>
      </div>
    </PageLayout>
  );
} 