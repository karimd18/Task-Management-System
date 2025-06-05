import { useState } from 'react';
import TeamsBoard from './TeamsBoard';
import TasksBoard from './TasksBoard';

export default function Dashboard() {
  const [showTaskBoard, setShowTaskBoard] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const handleViewTasks = (teamId: string | null) => {
    setSelectedTeam(teamId);
    setShowTaskBoard(true);
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setShowTaskBoard(false);
  };

  if (!showTaskBoard) {
    return <TeamsBoard onViewTasks={handleViewTasks} />;
  }

  return (
    <TasksBoard
      selectedTeam={selectedTeam}
      onBackToTeams={handleBackToTeams}
    />
  );
}