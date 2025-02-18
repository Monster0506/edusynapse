"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import {
  GitBranch,
  Code2,
  Network,
  Repeat,
  Bot,
  UserCog,
  FileText,
  Brain,
  Calculator,
} from "lucide-react";
import HomePageToolbar from "@/components/HomePageToolbar";
import { FeatureModal } from "@/components/FeatureModal";
import { WaitlistModal } from "@/components/WaitlistModal";

export default function Home() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  return (
    <div className="relative flex min-h-screen flex-col">
      <HomePageToolbar onOpenWaitlist={() => setIsWaitlistOpen(true)} />
      <main className="flex-1">
        <section className="flex min-h-screen flex-col items-center justify-center space-y-10 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container flex flex-col items-center justify-center gap-6 text-center px-4 md:px-6 max-w-5xl mx-auto"
          >
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              href="#"
              className="inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm font-medium"
            >
              🎉 <Separator className="mx-2 h-4" orientation="vertical" />{" "}
              Introducing EduSynapse
            </motion.a>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]"
            >
              AI-Powered
              <br />
              Personalized Learning
            </motion.h1>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl"
            >
              Transform your learning with AI-tailored educational journeys and
              real-time assistance.
              <br />
              Enjoy interactive code execution, smart reviews, and personalized
              feedback for a truly next-level studying experience.
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <Button
                size="lg"
                className="h-12 px-8"
                onClick={() => setIsWaitlistOpen(true)}
              >
                Join Waitlist
              </Button>
              <a href="https://youtu.be/9DW2QBCzRc0">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  View Demo
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </section>

        <Separator className="my-12" />

        <section className="py-12 md:py-24 lg:py-32" id="features">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 text-center mb-12"
            >
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Core Features
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Combining cutting-edge AI with proven learning methodologies
              </p>
            </motion.div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 },
                  }}
                  className="relative overflow-hidden rounded-lg border bg-background p-2 cursor-pointer"
                  onClick={() => setSelectedFeature(feature)}
                >
                  <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                    <feature.icon className="h-12 w-12 text-primary" />
                    <div className="space-y-2">
                      <h3 className="font-bold">{feature.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        <section className="py-12 md:py-24 lg:py-32" id="steve">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 text-center mb-12"
            >
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Meet STEVE
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Your AI assistant powered by S1 scaling and DeepSeek-R1
              </p>
            </motion.div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {steveFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 },
                  }}
                  className="flex flex-col overflow-hidden rounded-lg border bg-background p-6"
                >
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.name}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FeatureModal
        isOpen={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        imageSrc={selectedFeature?.imageSrc || ""}
        featureName={selectedFeature?.name || ""}
      />
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </div>
  );
}

interface Feature {
  name: string;
  description: string;
  icon: React.ElementType;
  imageSrc: string;
}

const features: Feature[] = [
  {
    name: "Adaptive Paths",
    // Expanded description explaining the benefit and uniqueness
    description:
      "AI-generated learning journeys tailored to your style, dynamically adjusting modules and difficulty based on your progress and performance, ensuring you stay both challenged and motivated.",
    icon: GitBranch,
    imageSrc: "/pictures/LearningPaths.jpeg?height=300&width=400",
  },
  {
    name: "Code Execution",
    description:
      "Run Python/JS directly in your browser with our secure sandbox environment—experiment with code on the fly and see outputs instantly.",
    icon: Code2,
    imageSrc: "/pictures/Executable.jpeg?height=300&width=400",
  },
  {
    name: "Knowledge Graph",
    description:
      "Visualize concept relationships through an interactive graph that helps you grasp complex topics by revealing how ideas connect and overlap.",
    icon: Network,
    imageSrc: "/pictures/KnowledgeGraph.jpeg?height=300&width=400",
  },
  {
    name: "Smart Reviews",
    description:
      "Optimized scheduling powered by our Spaced Repetition System to help you retain information longer with customized review intervals.",
    icon: Repeat,
    imageSrc: "/pictures/Practice.jpeg?height=300&width=400",
  },
  {
    name: "AI Tutor",
    description:
      "Access 24/7 assistance from STEVE, your personal AI tutor ready to offer on-demand explanations, clarifications, and examples.",
    icon: Bot,
    imageSrc: "/pictures/Chat.jpeg?height=300&width=400",
  },
  {
    name: "Personalization",
    description:
      "Get content curated to your interests and learning style, ensuring maximum engagement and efficient knowledge acquisition across various subjects.",
    icon: UserCog,
    imageSrc: "/pictures/Profile.jpeg?height=300&width=400",
  },
];

const steveFeatures = [
  {
    name: "File Reader",
    // Expanded description with a bit more depth
    description:
      "Upload and analyze your own study materials—STEVE extracts key points, creates summaries, and suggests quizzes for a deeper understanding of your content.",
    icon: FileText,
  },
  {
    name: "Think Tool",
    description:
      "Break down complex concepts step by step. STEVE uses advanced reasoning (DeepSeek-R1) to help you explore detailed explanations and logical thought processes.",
    icon: Brain,
  },
  {
    name: "Math Engine",
    description:
      "Perform advanced calculations with structured explanations, covering everything from basic arithmetic to higher-level operations, complete with detailed solution steps.",
    icon: Calculator,
  },
];
