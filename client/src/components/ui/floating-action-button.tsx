import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";

export type FloatingActionButtonProps = {
  onClick: () => void;
  icon?: any;
};

export function FloatingActionButton({ onClick, icon = "plus" }: FloatingActionButtonProps) {
  return (
    <div className="fixed right-6 bottom-6 z-20">
      <Button
        type="button"
        onClick={onClick}
        className="inline-flex items-center p-3 rounded-full shadow-lg text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <FontAwesomeIcon icon={icon} className="text-xl" />
      </Button>
    </div>
  );
}
