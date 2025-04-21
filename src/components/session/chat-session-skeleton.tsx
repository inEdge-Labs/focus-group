import { Skeleton } from "@/components/ui/skeleton";

export function ChatSessionSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-3 max-w-[85%] ${i % 2 === 0 ? "ml-auto" : "mr-auto"}`}
          >
            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <Skeleton
              className={`h-${20 + i * 10} w-full max-w-md rounded-lg`}
            />
            {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Skeleton className="h-[60px] w-full" />
          <Skeleton className="h-[60px] w-[60px]" />
        </div>
      </div>
    </div>
  );
}
