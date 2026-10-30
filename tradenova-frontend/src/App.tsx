import { RouterProvider } from "react-router-dom";
import { router } from "./router"; // router.tsx 위치에 맞게 경로 수정
import { LanguageProvider } from "./i18n/LanguageProvider";

export default function App() {
  return <LanguageProvider><RouterProvider router={router} /></LanguageProvider>;
}
