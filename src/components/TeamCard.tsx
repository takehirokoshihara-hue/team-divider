import { useDroppable } from '@dnd-kit/core';
import type { Team } from '../types';
import { MemberCard } from './MemberCard';

interface TeamCardProps {
  team: Team;
  activeId: string | null;
}

export function TeamCard({ team, activeId }: TeamCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
    data: { teamId: team.id },
  });

  const leader = team.members.find((m) => m.isManager);

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border-2 p-4 flex flex-col gap-2 transition-colors
        ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-bold text-gray-800 text-base">{team.name}</h3>
          {leader && (
            <p className="text-xs text-blue-600 font-medium">リーダー: {leader.name}</p>
          )}
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {team.members.length}人
        </span>
      </div>
      <div className="flex flex-col gap-1.5 min-h-12">
        {team.members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            teamId={team.id}
            isDragging={activeId === `${team.id}::${member.id}`}
          />
        ))}
        {team.members.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-200 rounded-lg">
            ここにドロップ
          </div>
        )}
      </div>
    </div>
  );
}
