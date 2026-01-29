import { CreatePasteForm } from "@/components/CreatePasteForm";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background subtle-grid pb-20">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold font-mono">
              P
            </div>
            <h1 className="font-bold text-lg tracking-tight">Pastebin Lite</h1>
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            Secure, ephemeral text sharing
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Share text <span className="text-muted-foreground">simply.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-lg mx-auto text-lg"
          >
            Paste your code or text below. Set an optional expiration time or view limit.
          </motion.p>
        </div>

        <CreatePasteForm />
      </main>
      
      <footer className="fixed bottom-0 w-full py-4 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur border-t border-border/40">
        <div className="container mx-auto">
          Built with React, Tailwind & Framer Motion
        </div>
      </footer>
    </div>
  );
}
