import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreatePasteInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreatePaste() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreatePasteInput) => {
      // Validate input before sending using the shared Zod schema
      const validated = api.pastes.create.input.parse(data);
      
      const res = await fetch(api.pastes.create.path, {
        method: api.pastes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.pastes.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create paste");
      }

      return api.pastes.create.responses[201].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Error creating paste",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function usePaste(id: string) {
  return useQuery({
    queryKey: [api.pastes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.pastes.get.path, { id });
      const res = await fetch(url);

      if (res.status === 404) {
        throw new Error("Paste not found or expired");
      }

      if (!res.ok) {
        throw new Error("Failed to fetch paste");
      }

      return api.pastes.get.responses[200].parse(await res.json());
    },
    retry: false, // Don't retry 404s
  });
}
