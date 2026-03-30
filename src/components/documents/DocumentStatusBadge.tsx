import { Badge } from '@/components/ui/badge';
import { DocumentStatus, documentStatusDisplayNames } from '@/types/database';
import { cn } from '@/lib/utils';

/**
 * DocumentStatusBadge
 *
 * Small reusable badge to visually represent the status of a document.
 *
 * The EduFlow platform defines three possible states for student
 * documentation: `pendiente` (pending), `entregado` (delivered) and
 * `observaciones` (requires review or has notes).
 *
 * This component chooses sensible Tailwind colour classes for each
 * status and displays the corresponding Spanish display name.
 *
 * Usage:
 * ```tsx
 * <DocumentStatusBadge status="pendiente" />
 * ```
 */
const documentStatusColors: Record<DocumentStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  entregado: 'bg-green-100 text-green-800',
  observaciones: 'bg-blue-100 text-blue-800',
};

export interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium', documentStatusColors[status], className)}
    >
      {documentStatusDisplayNames[status]}
    </Badge>
  );
}
