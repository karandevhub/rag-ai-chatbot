import { motion } from 'framer-motion';
import { FileText, MessageSquare, ArrowRight, Upload } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Overview = () => {
  return (
    <div
      className="overflow-y-auto scrollbar-hide"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <motion.div
        className="max-w-4xl mx-auto md:mt-12 mt-6 px-4 pb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4 md:space-y-8"
        >
          <motion.div variants={item} className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
                <FileText size={24} className="text-primary md:size-8" />
              </div>
              <div className="relative">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ArrowRight size={20} className="text-muted-foreground md:size-6" />
                </motion.div>
              </div>
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
                <MessageSquare size={24} className="text-primary md:size-8" />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight px-2">
              DOCs Assistant
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
             Ask questions, get insights,
              and explore your content through AI-powered conversations.
            </p>
          </motion.div>
          <motion.div variants={item}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-8">
              {[
                {
                  icon: <MessageSquare className="size-5 md:size-5" />,
                  title: "Smart Conversations",
                  description: "Ask questions naturally and get context-aware responses"
                },
                {
                  icon: <FileText className="size-5 md:size-5" />,
                  title: "Deep Understanding",
                  description: "AI analyzes your documents to provide accurate insights"
                }
              ].map((feature, i) => (
                <Card key={i} className="group hover:shadow-lg transition-all duration-300 border border-muted">
                  <CardContent className="p-4 md:p-5">
                    <div className='flex items-baseline'>
                      <div className="size-10 md:size-15 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                        {feature.icon}
                      </div>
                      <p className="font-semibold mb-1 md:mb-2 mx-4">{feature.title}</p>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default Overview;