import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPasteSchema } from "@shared/schema";
import { useCreatePaste } from "@/hooks/use-pastes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check, Terminal, FileCode2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

// Form type
type FormData = z.infer<typeof insertPasteSchema>;

export function CreatePasteForm() {
  const { toast } = useToast();
  const createPaste = useCreatePaste();
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(insertPasteSchema),
    defaultValues: {
      content: "",
      ttlSeconds: undefined,
      maxViews: undefined,
    },
  });

  const onSubmit = (data: FormData) => {
    createPaste.mutate(data, {
      onSuccess: (response) => {
        setCreatedUrl(response.url);
        toast({
          title: "Paste created!",
          description: "Your paste is ready to share.",
        });
        form.reset();
      },
    });
  };

  const copyToClipboard = async () => {
    if (createdUrl) {
      await navigator.clipboard.writeText(createdUrl);
      setHasCopied(true);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border/50 shadow-xl shadow-black/5 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-6 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <FileCode2 className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-medium">New Paste</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form id="paste-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-muted-foreground ml-1">
                  Content
                </Label>
                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="// Paste your code or text here..."
                    className="min-h-[300px] font-mono text-sm resize-y bg-background/50 focus:bg-background transition-all duration-200"
                    {...form.register("content")}
                  />
                  {form.formState.errors.content && (
                    <p className="text-destructive text-xs mt-1 absolute -bottom-5 left-1">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ttlSeconds" className="text-sm font-medium text-muted-foreground ml-1">
                    Expiration (Seconds)
                  </Label>
                  <Input
                    id="ttlSeconds"
                    type="number"
                    placeholder="e.g. 3600 (1 hour)"
                    className="font-mono"
                    {...form.register("ttlSeconds", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground ml-1">Optional. Leave empty for no expiration.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxViews" className="text-sm font-medium text-muted-foreground ml-1">
                    Burn After Reading (Max Views)
                  </Label>
                  <Input
                    id="maxViews"
                    type="number"
                    placeholder="e.g. 1"
                    className="font-mono"
                    {...form.register("maxViews", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground ml-1">Optional. Leave empty for unlimited views.</p>
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="bg-muted/20 border-t border-border/50 py-4 flex justify-between items-center">
            <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              <span>Ready to paste</span>
            </div>
            <Button 
              type="submit" 
              form="paste-form"
              disabled={createPaste.isPending}
              className="min-w-[120px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              {createPaste.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Paste"
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <AnimatePresence>
        {createdUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-primary">Paste Created Successfully!</h3>
                    <div className="px-2 py-1 bg-background rounded border border-border text-xs font-mono text-muted-foreground">
                      201 Created
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input 
                        readOnly 
                        value={createdUrl} 
                        className="pr-24 font-mono bg-background text-foreground/80"
                      />
                      <Button
                        size="sm"
                        className="absolute right-1 top-1 h-7"
                        variant={hasCopied ? "default" : "secondary"}
                        onClick={copyToClipboard}
                      >
                        {hasCopied ? (
                          <>
                            <Check className="h-3 w-3 mr-1" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <Button variant="outline" onClick={() => window.open(createdUrl, '_blank')}>
                      Open
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
