import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export type MatchCardProps = {
  user: {
    id: number;
    name: string;
    profileImage?: string;
    rating: number;
  };
  theirSkills: string[];
  yourNeeds: string[];
};

export function MatchCard({ user, theirSkills, yourNeeds }: MatchCardProps) {
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
    : '?';

  // Generate star rating display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex items-center">
          <Link href={`/profile/${user.id}`}>
            <a>
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </a>
          </Link>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <div className="flex items-center mt-1">
              <div className="flex text-yellow-400">
                {renderStars(user.rating)}
              </div>
              <span className="ml-1 text-sm text-gray-500">{user.rating}/5</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Their skills that match your needs:</h4>
            <div className="mt-2 flex flex-wrap gap-1">
              {theirSkills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="bg-green-100 text-green-800 hover:bg-green-200"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-500">Their needs that match your skills:</h4>
            <div className="mt-2 flex flex-wrap gap-1">
              {yourNeeds.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 text-right">
        <Link href={`/profile/${user.id}`}>
          <Button className="text-white bg-primary hover:bg-indigo-700">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
