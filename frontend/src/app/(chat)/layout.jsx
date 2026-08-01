import RequireAuth from "@/components/auth/RequireAuth";
import SocketProvider from "@/components/chat/SocketProvider";

export default function ChatLayout({ children }) {
  return (
    <RequireAuth>
      <SocketProvider>{children}</SocketProvider>
    </RequireAuth>
  );
}