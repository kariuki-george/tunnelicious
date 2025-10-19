"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return confirming ? (
    <div className="flex gap-2">
      <Button variant="destructive" size="sm" onClick={onConfirm}>
        Confirm
      </Button>
      <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  ) : (
    <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}
