import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export type ExchangeItemProps = {
  id: number;
  title: string;
  partnerName: string;
  partnerImage?: string;
  partnerId: number;
  status: string;
  startedAt: string | Date;
  yourSkill: string;
  theirSkill: string;
  nextSession?: string | Date | null;
};

export function ExchangeItem({
  id,
  title,
  partnerName,
  partnerImage,
  partnerId,
  status,
  startedAt,
  yourSkill,
  theirSkill,
  nextSession
}: ExchangeItemProps) {
  const initials = partnerName
    ? partnerName
        .split(' ')
        .map(n => n[0])
        .join('')
    : '?';

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    pending: "Pending",
    accepted: "Active",
    in_progress: "In Progress",
    completed: "Completed",
    rejected: "Rejected"
  };

  return (
    <li>
      <Link href={`/exchanges?id=${id}`}>
        <a className="block hover:bg-gray-50">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href={`/profile/${partnerId}`}>
                  <a>
                    <Avatar>
                      <AvatarImage src={partnerImage} alt={partnerName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </a>
                </Link>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500">with {partnerName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Badge className={statusColors[status as keyof typeof statusColors]}>
                  {statusLabels[status as keyof typeof statusLabels]}
                </Badge>
                <p className="ml-2 text-sm text-gray-500">Started {format(new Date(startedAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  <FontAwesomeIcon icon="exchange-alt" className="flex-shrink-0 mr-1.5 text-gray-400" />
                  You: {yourSkill} • Them: {theirSkill}
                </p>
              </div>
              {nextSession && (
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <FontAwesomeIcon icon="calendar" className="flex-shrink-0 mr-1.5 text-gray-400" />
                  <p>
                    Next session: {format(new Date(nextSession), 'MMM d, yyyy, h:mm a')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </a>
      </Link>
    </li>
  );
}
