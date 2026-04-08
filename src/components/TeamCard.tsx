import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Team } from '../types';
import { MemberCard } from './MemberCard';

interface TeamCardProps {
  team: Team;
  activeId: string | null;
  columnsPerTeam: number;
  onRename: (teamId: string, newName: string) => void;
}

export function TeamCard({ team, activeId, columnsPerTeam, onRename }: TeamCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
    data: { teamId: team.id },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(team.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // team.nameが外部から変わった場合にeditValueを同期
  useEffect(() => {
    if (!isEditing) setEditValue(team.name);
  }, [team.name, isEditing]);

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== team.name) {
      onRename(team.id, trimmed);
    } else {
      setEditValue(team.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') {
      setEditValue(team.name);
      setIsEditing(false);
    }
  };

  const leader = team.members.find((m) => m.isManager);
  const isGrid = columnsPerTeam > 1;

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border-2 p-4 flex flex-col gap-2 transition-colors
        ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="font-bold text-gray-800 text-base w-full border-b-2 border-blue-400 outline-none bg-transparent"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="font-bold text-gray-800 text-base hover:text-blue-600 transition-colors text-left group flex items-center gap-1"
              title="クリックして編集"
            >
              {team.name}
              <svg
                className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {leader && (
            <p className="text-xs text-blue-600 font-medium">リーダー: {leader.name}</p>
          )}
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
          {team.members.length}人
        </span>
      </div>

      {/* メンバー表示: グリッド or リスト */}
      <div
        className="min-h-12"
        style={isGrid ? {
          display: 'grid',
          gridTemplateColumns: `repeat(${columnsPerTeam}, minmax(0, 1fr))`,
          gap: '6px',
        } : undefined}
      >
        {!isGrid && (
          <div className="flex flex-col gap-1.5">
            {team.members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                teamId={team.id}
                isDragging={activeId === `${team.id}::${member.id}`}
                compact={false}
              />
            ))}
          </div>
        )}
        {isGrid && team.members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            teamId={team.id}
            isDragging={activeId === `${team.id}::${member.id}`}
            compact={true}
          />
        ))}
        {team.members.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-200 rounded-lg col-span-full">
            ここにドロップ
          </div>
        )}
      </div>
    </div>
  );
}
