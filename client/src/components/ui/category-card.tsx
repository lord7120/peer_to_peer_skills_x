import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "wouter";

export type CategoryCardProps = {
  icon: any;
  name: string;
  backgroundColor: string;
  textColor: string;
}

export function CategoryCard({ icon, name, backgroundColor, textColor }: CategoryCardProps) {
  return (
    <Link href={`/discover?category=${name}`}>
      <a className="flex flex-col items-center px-4 py-5 bg-white shadow rounded-lg hover:shadow-md transition-shadow">
        <div className={`p-2 rounded-full ${backgroundColor} ${textColor}`}>
          <FontAwesomeIcon icon={icon} className="text-xl" />
        </div>
        <span className="mt-2 text-sm font-medium text-gray-900">{name}</span>
      </a>
    </Link>
  );
}

export function CategoryGrid() {
  const categories = [
    { name: "Programming", icon: "laptop-code", backgroundColor: "bg-indigo-100", textColor: "text-primary" },
    { name: "Design", icon: "paint-brush", backgroundColor: "bg-green-100", textColor: "text-green-600" },
    { name: "Languages", icon: "language", backgroundColor: "bg-blue-100", textColor: "text-blue-600" },
    { name: "Music", icon: "music", backgroundColor: "bg-purple-100", textColor: "text-purple-600" },
    { name: "Photography", icon: "camera", backgroundColor: "bg-yellow-100", textColor: "text-yellow-600" },
    { name: "Math & Science", icon: "calculator", backgroundColor: "bg-red-100", textColor: "text-red-600" },
    { name: "Health & Fitness", icon: "heartbeat", backgroundColor: "bg-pink-100", textColor: "text-pink-600" },
    { name: "More", icon: "ellipsis-h", backgroundColor: "bg-gray-100", textColor: "text-gray-600" }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {categories.map(category => (
        <CategoryCard 
          key={category.name}
          icon={category.icon}
          name={category.name}
          backgroundColor={category.backgroundColor}
          textColor={category.textColor}
        />
      ))}
    </div>
  );
}
