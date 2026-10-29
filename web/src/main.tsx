import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./components/Toast";
import "./index.css";

import { CourseApp } from "./course/CourseApp";

// Students use /course; everything else is Noa's command-center dashboard.
function isCoursePath() {
  const path = window.location.pathname.slice(import.meta.env.BASE_URL.length - 1);
  return path === "/course" || path.startsWith("/course/");
}

function Root() {
  const [isCourse, setIsCourse] = React.useState(isCoursePath);
  React.useEffect(() => {
    const sync = () => setIsCourse(isCoursePath());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  return isCourse ? <CourseApp /> : <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <Root />
    </ToastProvider>
  </React.StrictMode>,
);
