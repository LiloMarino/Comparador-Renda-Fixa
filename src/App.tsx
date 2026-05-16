import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layouts/main-layout";
import { NotFoundPage } from "@/pages/not-found-page";
import { ComparatorPage } from "@/features/comparator/pages/comparator-page";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<ComparatorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
