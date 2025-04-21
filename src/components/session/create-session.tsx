"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateSessionForm } from "./create-session-form";
import { ScrollArea } from "../ui/scroll-area";

export function CreateSessionButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = (sessionId: string) => {
    setOpen(false);
    router.push(`/sessions/${sessionId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Focus Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <ScrollArea className="max-h-[700px] w-full">
          <DialogHeader>
            <DialogTitle>Create New Focus Group</DialogTitle>
            <DialogDescription>
              Set up a new focus group session with personas and a product idea.
            </DialogDescription>
          </DialogHeader>
          <CreateSessionForm onSuccess={handleSuccess} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
