import type { Member } from '../types';

interface MemberListProps {
  members: Member[];
  onRemove: (id: string) => void;
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

export function MemberList({ members, onRemove }: MemberListProps) {
  const managerCount = members.filter((m) => m.isManager).length;
  const talkativeCount = members.filter((m) => m.isTalkative).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700 text-sm">参加メンバー</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{members.length}人</span>
      </div>
      <div className="flex gap-2 mb-2">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">MG: {managerCount}</span>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">🔥: {talkativeCount}</span>
      </div>
      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 group"
          >
            <div className="flex-1 min-w-0 flex items-center gap-1 flex-wrap">
              {member.isManager && (
                <span className="text-xs bg-blue-600 text-white px-1 py-0 rounded font-bold leading-tight">MG</span>
              )}
              {member.isTalkative && <span className="text-xs">🔥</span>}
              <span className="text-sm text-gray-800">{member.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${getDeptColor(member.department)}`}>
                {member.department}
              </span>
            </div>
            <button
              onClick={() => onRemove(member.id)}
              className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm flex-shrink-0"
              title="削除"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
