import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export type SkillCardProps = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  isOffering: boolean;
  timeAvailability: string;
  createdAt: string | Date;
  user: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

export function SkillCard({ 
  id, 
  title, 
  description, 
  tags, 
  isOffering, 
  timeAvailability, 
  createdAt, 
  user 
}: SkillCardProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
    : '?';

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Link href={`/profile/${user.id}`}>
            <a>
              <Avatar>
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </a>
          </Link>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">Posted {timeAgo}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isOffering ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          <span className="mr-1">●</span> {isOffering ? 'Offering' : 'Looking for'}
        </span>
      </div>
      <div className="px-4 py-3">
        <Link href={`/skill/${id}`}>
          <a className="hover:underline">
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
          </a>
        </Link>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="outline"
              className={`bg-${isOffering ? 'indigo' : 'blue'}-100 text-${isOffering ? 'indigo' : 'blue'}-800 hover:bg-${isOffering ? 'indigo' : 'blue'}-200`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        <div>
          <span className="flex items-center text-sm text-gray-500">
            <FontAwesomeIcon icon="clock" className="mr-1.5 text-gray-400" />
            {timeAvailability}
          </span>
        </div>
        <Link href={`/skill/${id}`}>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-indigo-50">
            Contact <FontAwesomeIcon icon="arrow-right" className="ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
