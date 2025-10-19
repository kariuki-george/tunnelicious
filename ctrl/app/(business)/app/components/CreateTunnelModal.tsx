"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";

export const CreateTunnel = () => {
  const [name, setName] = useState("");

  const qc = useQueryClient();

  const createTunnel = trpc.tunnels.create.useMutation({
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [["tunnels", "list"]] });
      toast.success("Tunnel created");
      setName("");
    },
    onError: (err) => {
      toast.error(err?.message ?? "something went wrong");
    },
  });
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a tunnel</DialogTitle>
          <DialogDescription>
            A tunnel will be created and an auth token provided which you can
            pass to the agent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Tunnel name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>{" "}
        <DialogFooter>
          <Button
            className="hover:cursor-pointer"
            onClick={() => createTunnel.mutate({ name })}
            type="submit"
            disabled={!name || createTunnel.isPending}
          >
            {createTunnel.isPending ? "Creating..." : "Create"}
          </Button>{" "}
          <DialogClose asChild>
            <Button className="hover:cursor-pointer">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
