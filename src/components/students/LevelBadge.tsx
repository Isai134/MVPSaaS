import { Badge } from '@/components/ui/badge';
import { levelColors } from '@/types/database';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: string;
  className?: string;
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const colorClass = levelColors[level] || 'bg-gray-500';

  return (
    <Badge 
      className={cn("text-xs font-medium text-white", colorClass, className)}
    >
      {level}
    </Badge>
  );
}
