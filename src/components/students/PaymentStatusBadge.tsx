import { Badge } from '@/components/ui/badge';
import { PaymentStatus, paymentStatusColors, paymentStatusDisplayNames } from '@/types/database';
import { cn } from '@/lib/utils';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  return (
    <Badge 
      variant="secondary"
      className={cn("text-xs font-medium", paymentStatusColors[status], className)}
    >
      {paymentStatusDisplayNames[status]}
    </Badge>
  );
}
