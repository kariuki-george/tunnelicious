"use client";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ApiKeyDisplay } from "./ApiKeyDisplay";

// biome-ignore lint/suspicious/noExplicitAny: <no review>
export function TunnelCard({ tunnel }: { tunnel: any }) {
  const qc = useQueryClient();

  const deleteTunnel = trpc.tunnels.delete.useMutation({
    onSuccess: () => qc.invalidateQueries({ queryKey: [["tunnels", "list"]] }),
  });

  const copyKey = () => {
    navigator.clipboard.writeText(tunnel.apiKey);
    toast.success("Copied API key");
  };

  return (
    <div className="border rounded-xl p-4 shadow-sm flex flex-col gap-3 bg-card">
      <div className="flex justify-between items-center">
        <div className="font-semibold">{tunnel.name}</div>
        <Button variant="ghost" size="icon" onClick={copyKey}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-baseline gap-4 text-sm text-muted-foreground truncate">
        <ApiKeyDisplay apiKey={tunnel.apiKey} />
      </div>
      <div className="flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteTunnel.mutate({ id: tunnel.id })}
          disabled={deleteTunnel.isPending}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
