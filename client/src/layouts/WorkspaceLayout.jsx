import { Outlet } from "react-router-dom";
import WorkspaceSidebar from "../components/workspace/WorkspaceSidebar";
import WorkspaceTopbar from "../components/workspace/WorkspaceTopbar";

export default function WorkspaceLayout() {
  return (
    <div className="min-h-screen flex bg-[#F7F8FA] invoice-grid">
      <WorkspaceSidebar />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <WorkspaceTopbar />
        <main className="flex-1 min-w-0 px-4 sm:px-7 py-6 max-w-[1280px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
