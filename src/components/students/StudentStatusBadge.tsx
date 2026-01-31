import { Badge } from '@/components/ui/badge';
import { StudentStatus, studentStatusColors, studentStatusDisplayNames } from '@/types/database';
import { cn } from '@/lib/utils';

interface StudentStatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

export function StudentStatusBadge({ status, className }: StudentStatusBadgeProps) {
  return (
    <Badge 
      variant="secondary"
      className={cn("text-xs font-medium", studentStatusColors[status], className)}
    >
      {studentStatusDisplayNames[status]}
    </Badge>
  );
}
