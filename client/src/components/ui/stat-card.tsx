import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type StatCardProps = {
  title: string;
  value: string | number;
  icon: any;
  iconBgColor: string;
  iconColor: string;
};

export function StatCard({ title, value, icon, iconBgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <FontAwesomeIcon icon={icon} className={`${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
