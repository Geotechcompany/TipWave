import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import { Shield, Scale, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  const sections = [
    {
      icon: <Shield />,
      title: "Platform Usage",
      content: `By accessing our platform, you agree to use it in accordance with these terms. 
      Users must be at least 18 years old and have the legal capacity to enter into binding contracts.`
    },
    {
      icon: <Scale />,
      title: "Rights & Responsibilities",
      content: `DJs and venues are responsible for maintaining accurate information and complying 
      with local laws regarding music performance and licensing.`
    },
    {
      icon: <FileText />,
      title: "Content Policy",
      content: `Users retain ownership of their content but grant us a license to use, 
      display, and distribute it on our platform. Content must not infringe on others' rights.`
    },
    {
      icon: <AlertCircle />,
      title: "Liability",
      content: `We provide the platform "as is" and are not liable for any damages arising 
      from its use or temporary unavailability.`
    }
  ];

  const legalDocs = [
    { title: "Privacy Policy", link: "/privacy" },
    { title: "Copyright Notice", link: "/copyright" },
    { title: "Cookie Policy", link: "/cookies" },
    { title: "Acceptable Use Policy", link: "/acceptable-use" }
  ];

  return (
    <PageLayout 
      title="Terms of Service" 
      breadcrumbs={[{ label: "Company" }, { label: "Terms" }]}
    >
      <div className="space-y-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-invert max-w-none"
        >
          <p className="text-xl text-gray-300">
            These terms of service (&quot;Terms&quot;) govern your access to and use of our platform. 
            Please read these Terms carefully before using our services.
          </p>
          <p className="text-gray-400">
            Last updated: March 1, 2024
          </p>
        </motion.div>

        {/* Main Sections */}
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
              <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
              <p className="text-gray-400">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Related Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Related Legal Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {legalDocs.map((doc, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start"
                asChild
              >
                <a href={doc.link}>
                  <FileText className="h-4 w-4 mr-2" />
                  {doc.title}
                </a>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Detailed Terms */}
        <div className="prose prose-invert max-w-none">
          <h2>1. Account Terms</h2>
          <p>
            You are responsible for maintaining the security of your account and password.
            We cannot and will not be liable for any loss or damage from your failure to
            comply with this security obligation.
          </p>

          <h2>2. Payment Terms</h2>
          <p>
            A valid payment method is required for paid services. By providing payment 
            information, you authorize us to charge your payment method for the services
            you have selected.
          </p>

          <h2>3. Cancellation and Termination</h2>
          <p>
            You are solely responsible for properly canceling your account. Account
            cancellation requests must be submitted through the appropriate channels.
          </p>

          <h2>4. Modifications to the Service</h2>
          <p>
            We reserve the right to modify or discontinue any part of our service with
            or without notice. We shall not be liable to you or any third party for any
            modification, suspension, or discontinuance of the service.
          </p>
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Questions About Our Terms?</h2>
          <p className="text-gray-300 mb-6">
            Contact our legal team for any questions regarding these terms.
          </p>
          <Button>Contact Legal Team</Button>
        </motion.div>
      </div>
    </PageLayout>
  );
} 