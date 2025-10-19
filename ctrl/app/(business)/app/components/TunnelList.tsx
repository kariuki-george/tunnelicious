"use client";
import { TunnelCard } from "./TunnelCard";
import { trpc } from "@/app/_trpc/client";
import { CreateTunnel } from "./CreateTunnelModal";

export function TunnelList() {
  const { data: tunnels, isPending } = trpc.tunnels.list.useQuery();

  if (isPending) return <div>Loading tunnels...</div>;
  if (!tunnels?.length)
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-3">No tunnels yet</p>
        <CreateTunnel />
      </div>
    );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {tunnels.map((t) => (
        <TunnelCard key={t.id} tunnel={t} />
      ))}
    </div>
  );
}
