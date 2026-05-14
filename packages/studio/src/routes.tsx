import { AppShell } from "./components/layout/AppShell"
import { createRoutesFromElements, Route } from "react-router"

export const routes = createRoutesFromElements(
  <Route path="/" element={<AppShell />}>
    <Route index element={<div className="p-4">Welcome to Studio</div>} />
  </Route>
)