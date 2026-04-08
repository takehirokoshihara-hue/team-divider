import { useDraggable } from '@dnd-kit/core';
import type { TeamMember } from '../types';

interface MemberCardProps {
  member: TeamMember;
  teamId: string;
  isDragging?: boolean;
  compact?: boolean;
}

const DEPT_COLORS: Record<string, string> = {
  'CEO': 'bg-purple-100 text-purple-800',
  'AnyReach 1to1': 'bg-pink-100 text-pink-800',
  'Delivery': 'bg-blue-100 text-blue-800',
  'Marketing': 'bg-orange-100 text-orange-800',
  'BizDev/FDE': 'bg-emerald-100 text-emerald-800',
  'BizDev/FS': 'bg-teal-100 text-teal-800',
  'Customer Success/PM': 'bg-sky-100 text-sky-800',
  'Account Management': 'bg-violet-100 text-violet-800',
  'Customer Support': 'bg-rose-100 text-rose-800',
  'Product': 'bg-amber-100 text-amber-800',
  'Engineering': 'bg-cyan-100 text-cyan-800',
  'Design': 'bg-fuchsia-100 text-fuchsia-800',
  'Corporate/HR & GA': 'bg-lime-100 text-lime-800',
};

function getDeptColor(dept: string): string {
  return DEPT_COLORS[dept] ?? 'bg-gray-100 text-gray-700';
}

export function MemberCard({ member, teamId, isDragging = false, compact = false }: MemberCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${teamId}::${member.id}`,
    data: { memberId: member.id, teamId },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
          flex flex-col items-center gap-1 p-2 rounded-lg border cursor-grab active:cursor-grabbing
          transition-shadow select-none text-center
          ${member.isManager
            ? 'bg-blue-50 border-blue-200 hover:border-blue-400'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}
          ${isDragging ? 'shadow-lg opacity-80' : ''}
        `}
      >
        <span
          className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0
            ${member.isManager ? 'bg-blue-600' : 'bg-gray-500'}`}
        >
          {member.seatNumber}
        </span>
        <div className="w-full min-w-0">
          <div className="flex items-center justify-center gap-0.5 flex-wrap">
            {member.isManager && (
              <span className="text-xs bg-blue-600 text-white px-1 rounded font-bold leading-none">MG</span>
            )}
            {member.isTalkative && <span className="text-xs">🔥</span>}
          </div>
          <p className="text-xs font-medium text-gray-900 leading-tight break-all">{member.name}</p>
        </div>
        <span className={`text-xs px-1 py-0.5 rounded-full font-medium leading-none w-full text-center truncate ${getDeptColor(member.department)}`}>
          {member.department}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing
        transition-shadow select-none
        ${member.isManager
          ? 'bg-blue-50 border-blue-200 hover:border-blue-400'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}
        ${isDragging ? 'shadow-lg opacity-80' : ''}
      `}
    >
      {/* 席番号バッジ */}
      <span
        className={`flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center
          ${member.isManager ? 'bg-blue-600' : 'bg-gray-600'}`}
      >
        {member.seatNumber}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {member.isManager && (
            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold leading-none">MG</span>
          )}
          {member.isTalkative && (
            <span className="text-xs" title="盛り上げ役">🔥</span>
          )}
          <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getDeptColor(member.department)}`}>
          {member.department}
        </span>
      </div>
      <span className="text-gray-300 text-xs flex-shrink-0">⠿</span>
    </div>
  );
}
