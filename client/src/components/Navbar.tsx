import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Bell, X, User as UserIcon, ChevronDown, Loader } from "lucide-react";
import { useInvitations } from "../contexts/InvitationContext";

export function Navbar({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const {
    invites,
    loading,
    error: notifError,
    accept,
    decline,
  } = useInvitations();

  // Always treat invites as an array
  const safeInvites = invites ?? [];
  const pendingCount = safeInvites.filter((i) => i.status === "Pending").length;

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const handleInviteAction = async (
    action: (id: string) => Promise<void>,
    id: string
  ) => {
    try {
      await action(id);
    } catch (err) {
      console.error("Invitation action failed:", err);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Task Manager
          </h1>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                aria-label="Notifications"
                aria-expanded={notifOpen}
                onClick={() => {
                  setNotifOpen((o) => !o);
                }}
                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {loading ? (
                  <Loader className="w-6 h-6 text-gray-600 dark:text-gray-300 animate-spin" />
                ) : (
                  <>
                    <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </button>

              {notifOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-50"
                >
                  <div className="flex justify-between items-center px-4 py-2 border-b dark:border-gray-700">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Invitations
                    </span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                    >
                      <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <ul className="max-h-64 overflow-y-auto">
                    {notifError ? (
                      <li className="px-4 py-2 text-red-500 dark:text-red-400 text-sm">
                        {notifError}
                      </li>
                    ) : safeInvites.length === 0 ? (
                      <li className="px-4 py-2 text-gray-500 dark:text-gray-400">
                        No pending invites
                      </li>
                    ) : (
                      safeInvites.map((inv) => (
                        <li
                          key={inv.id}
                          className="px-4 py-3 border-b dark:border-gray-700"
                          role="menuitem"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {inv.teamName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Invited by {inv.inviterUsername}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() =>
                                  handleInviteAction(accept, inv.id)
                                }
                                className={`px-3 py-1 text-sm rounded ${
                                  inv.status === "Pending"
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default"
                                }`}
                                disabled={inv.status !== "Pending"}
                              >
                                {inv.status === "Accepted"
                                  ? "Accepted"
                                  : "Accept"}
                              </button>
                              <button
                                onClick={() =>
                                  handleInviteAction(decline, inv.id)
                                }
                                className={`px-3 py-1 text-sm rounded ${
                                  inv.status === "Pending"
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default"
                                }`}
                                disabled={inv.status !== "Pending"}
                              >
                                {inv.status === "Declined"
                                  ? "Declined"
                                  : "Decline"}
                              </button>
                            </div>
                          </div>
                          {inv.createdAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Invited{" "}
                              {new Date(inv.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userRef}>
              <button
                aria-label="User menu"
                aria-expanded={userOpen}
                onClick={() => setUserOpen((o) => !o)}
                className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  {user?.username}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>

              {userOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded-md z-50"
                >
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {children}
    </nav>
  );
}
