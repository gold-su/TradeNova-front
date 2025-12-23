import { RouterProvider } from "react-router-dom";
import { router } from "./router"; // router.tsx 위치에 맞게 경로 수정

export default function App() {
  return <RouterProvider router={router} />;
}
