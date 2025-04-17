import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// FontAwesome icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faPeopleArrows, faHome, faUser, faLightbulb, faSearch, 
  faComments, faExchangeAlt, faStar, faBars, faBell, 
  faQuestionCircle, faHandshake, faCheck, faEnvelope, 
  faLaptopCode, faPaintBrush, faLanguage, faMusic, 
  faCamera, faCalculator, faHeartbeat, faEllipsisH, 
  faClock, faArrowRight, faCalendar, faCloudUploadAlt,
  faPlus, faTimes, faChevronDown, faEdit
} from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(
  faPeopleArrows, faHome, faUser, faLightbulb, faSearch, 
  faComments, faExchangeAlt, faStar, faBars, faBell, 
  faQuestionCircle, faHandshake, faCheck, faEnvelope, 
  faLaptopCode, faPaintBrush, faLanguage, faMusic, 
  faCamera, faCalculator, faHeartbeat, faEllipsisH, 
  faClock, faArrowRight, faCalendar, faCloudUploadAlt,
  faPlus, faTimes, faChevronDown, faEdit
);

createRoot(document.getElementById("root")!).render(<App />);
