import { useRoute, Link } from "wouter";
import { usePaste } from "@/hooks/use-pastes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Clock, Eye, Copy, Check, ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function ViewPaste() {
  const [, params] = useRoute("/p/:id");
  const id = params?.id || "";
  const { data: paste, isLoading, error } = usePaste(id);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyContent = async () => {
    if (paste?.content) {
      await navigator.clipboard.writeText(paste.content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Raw content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background subtle-grid gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Retrieving paste...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background subtle-grid p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Paste Not Found</h1>
          <p className="text-muted-foreground text-lg">
            This paste may have expired, reached its view limit, or never existed in the first place.
          </p>
          <Link href="/">
            <Button size="lg" className="mt-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> Create New Paste
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background subtle-grid">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
            <h1 className="font-mono text-sm font-semibold truncate max-w-[200px] sm:max-w-md">
              paste/{id}
            </h1>
          </div>
          
          <Button variant="outline" size="sm" onClick={copyContent} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy Raw"}</span>
          </Button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          <div className="lg:col-span-3">
            <Card className="border-border shadow-lg shadow-black/5 min-h-[500px] flex flex-col">
              <div className="bg-muted/30 border-b border-border p-2 flex items-center gap-2 px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-500/50" />
                </div>
                <div className="text-xs text-muted-foreground font-mono ml-4 opacity-50">
                  text/plain
                </div>
              </div>
              <div className="p-0 flex-1 relative overflow-hidden group">
                <pre className="font-mono text-sm p-6 overflow-auto h-full w-full absolute inset-0 text-foreground/90 selection:bg-primary/10">
                  <code>{paste?.content}</code>
                </pre>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5" /> Expires
                  </div>
                  <div className="text-sm font-mono font-medium">
                    {paste?.expires_at ? (
                      format(new Date(paste.expires_at), "PP p")
                    ) : (
                      <span className="text-muted-foreground italic">Never</span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Eye className="w-3.5 h-3.5" /> Remaining Views
                  </div>
                  <div className="text-sm font-mono font-medium">
                    {paste?.remaining_views !== null ? (
                      <span className={paste?.remaining_views === 1 ? "text-destructive font-bold" : ""}>
                        {paste?.remaining_views} view{paste?.remaining_views === 1 ? "" : "s"} left
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Unlimited</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-primary block mb-1">Did you know?</strong>
              This paste is ephemeral. Once it expires or runs out of views, it is permanently deleted from our servers.
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
