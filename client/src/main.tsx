import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// FontAwesome icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faPeopleArrows, faHome, faUser, faCheck, faEnvelope, 
  faLock, faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(
  faPeopleArrows, faHome, faUser, faCheck, faEnvelope, 
  faLock, faEye, faEyeSlash
);

createRoot(document.getElementById("root")!).render(<App />);
