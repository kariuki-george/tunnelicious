"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clipboard, Eye, EyeOff } from "lucide-react";

export function ApiKeyDisplay({ apiKey }: { apiKey: string }) {
  const [hidden, setHidden] = useState(true);
  return (
    <div className="flex items-center gap-2 border rounded-lg pl-3 pr-1">
      <span className="font-mono w-2/3 text-sm">
        {hidden ? "••••••••••••••" : apiKey}
      </span>
      <Button variant="ghost" size="icon-sm" onClick={() => setHidden(!hidden)}>
        {hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigator.clipboard.writeText(apiKey)}
      >
        <Clipboard className="w-4 h-4" />
      </Button>
    </div>
  );
}
