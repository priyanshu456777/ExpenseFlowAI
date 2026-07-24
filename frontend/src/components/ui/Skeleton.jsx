import clsx from 'clsx';

export const Skeleton = ({ className }) => <div className={clsx('skeleton', className)} />;

export const CardSkeleton = () => (
  <div className="glass-card p-5">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const RowSkeleton = () => (
  <div className="flex items-center gap-4 py-3">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1">
      <Skeleton className="h-3.5 w-1/3 mb-2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
    <Skeleton className="h-4 w-16" />
  </div>
);
