import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { invitationsApi } from "../lib/api";
import type { InvitationResponse } from "../lib/api/types";
import { useTeam } from "./TeamContext";

interface InvitationContextType {
  invites: InvitationResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  accept: (id: string) => Promise<void>;
  decline: (id: string) => Promise<void>;
}

const InvitationContext = createContext<InvitationContextType>(
  {} as InvitationContextType
);

export function InvitationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loadTeams } = useTeam();
  const [invites, setInvites] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the refresh function
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await invitationsApi.list();
      setInvites(response.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load invitations"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize the accept/decline handlers
  const accept = useCallback(
    async (id: string) => {
      try {
        await invitationsApi.accept(id);
        await refresh();
        await loadTeams(); // Refresh teams after accepting an invitation
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to accept invitation"
        );
      }
    },
    [refresh]
  );

  const decline = useCallback(
    async (id: string) => {
      try {
        await invitationsApi.decline(id);
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to decline invitation"
        );
      }
    },
    [refresh]
  );

  // Load initial data only once
  useEffect(() => {
    refresh();
  }, [refresh]); // Only re-run if refresh function changes

  return (
    <InvitationContext.Provider
      value={{
        invites,
        loading,
        error,
        refresh,
        accept,
        decline,
      }}
    >
      {children}
    </InvitationContext.Provider>
  );
}

export const useInvitations = () => useContext(InvitationContext);
