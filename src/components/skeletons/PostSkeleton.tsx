import { Skeleton } from '@/components/ui/skeleton';

/**
 * Renders a skeleton placeholder for a post card.
 */
export const PostSkeleton = (): JSX.Element => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-[200px] w-full rounded-md" /> {/* Optional image skeleton */}
      <div className="flex justify-between pt-2">
        <Skeleton className="h-8 w-[70px]" />
        <Skeleton className="h-8 w-[70px]" />
        <Skeleton className="h-8 w-[70px]" />
      </div>
    </div>
  );
};
