import PageLayout from "@/components/layouts/PageLayout";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GettingStarted() {
  const sections = [
    {
      title: "Account Setup",
      steps: [
        {
          title: "Create Your Account",
          description: "Sign up for a TipWave account using your email or social login.",
          link: "/signup"
        },
        {
          title: "Choose Your Role",
          description: "Select whether you're a DJ or venue owner to access role-specific features.",
          link: "/onboarding"
        },
        {
          title: "Complete Your Profile",
          description: "Add your professional details, portfolio, and preferences.",
          link: "/settings/profile"
        }
      ]
    },
    {
      title: "Platform Basics",
      steps: [
        {
          title: "Dashboard Overview",
          description: "Learn about the key features and navigation of your dashboard.",
          link: "/docs/dashboard"
        },
        {
          title: "Payment Setup",
          description: "Configure your payment methods and payout preferences.",
          link: "/docs/payments"
        },
        {
          title: "Security Settings",
          description: "Set up two-factor authentication and security preferences.",
          link: "/docs/security"
        }
      ]
    }
  ];

  return (
    <PageLayout 
      title="Getting Started" 
      breadcrumbs={[
        { label: "Resources" }, 
        { label: "Documentation" }, 
        { label: "Getting Started" }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-invert max-w-none"
        >
          <div className="flex items-center gap-3 text-blue-400 mb-6">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold m-0">Welcome to TipWave</h1>
          </div>
          <p className="text-xl text-gray-300">
            Follow this guide to get started with TipWave and make the most of our platform&apos;s features.
            Whether you&apos;re a DJ or venue owner, we&apos;ll help you get up and running quickly.
          </p>
        </motion.div>

        {/* Setup Sections */}
        <div className="space-y-12">
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">{section.title}</h2>
              <div className="grid gap-6">
                {section.steps.map((step, stepIndex) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (stepIndex * 0.1) }}
                    className="relative flex items-start gap-4 bg-gray-800/50 rounded-xl p-6"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-400 mb-4">{step.description}</p>
                      <Link 
                        href={step.link}
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Learn more <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/20"
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-gray-300 mb-6">
            Now that you&apos;re familiar with the basics, create your account and start exploring TipWave&apos;s features.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/dashboard/user"
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Create Account
            </Link>
            <Link 
              href="/docs/api"
              className="px-6 py-2.5 rounded-full border border-blue-500/50 hover:bg-blue-500/10 text-white font-medium transition-colors"
            >
              View API Docs
            </Link>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
} 