import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Team, Member, TeamMember, DivisionMode } from './types';
import { createInitialMembers, generateMemberId } from './data/members';
import { divideTeams, moveMemberBetweenTeams } from './utils/teamDivider';
import { exportToPdf } from './utils/exportPdf';
import { TeamCard } from './components/TeamCard';
import { TeamSettings } from './components/TeamSettings';
import { AddMemberForm } from './components/AddMemberForm';
import { MemberList } from './components/MemberList';
import { MemberManagementModal } from './components/MemberManagementModal';

const STORAGE_KEY = 'team-divider-base-members';

function loadBaseMembers(): Member[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Member[];
  } catch {
    // ignore
  }
  return createInitialMembers();
}

function saveBaseMembers(members: Member[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export default function App() {
  const [baseMembers, setBaseMembers] = useState<Member[]>(() => loadBaseMembers());
  const [tempMembers, setTempMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showMgmt, setShowMgmt] = useState(false);
  // 列数設定（1=リスト表示、2以上=グリッド表示）
  const [columnsPerTeam, setColumnsPerTeam] = useState(1);
  // 直前のdivisionModeを保持（再シャッフル時に再利用）
  const [lastDivisionMode, setLastDivisionMode] = useState<DivisionMode>('spread');

  const allMembers = [...baseMembers, ...tempMembers];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleSaveBaseMembers = useCallback((updated: Member[]) => {
    setBaseMembers(updated);
    saveBaseMembers(updated);
    setShowMgmt(false);
  }, []);

  const handleAddTempMember = useCallback((member: Omit<Member, 'id'>) => {
    setTempMembers((prev) => [...prev, { ...member, id: generateMemberId() }]);
  }, []);

  const handleRemoveMember = useCallback((id: string) => {
    setTempMembers((prev) => prev.filter((m) => m.id !== id));
    setBaseMembers((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveBaseMembers(next);
      return next;
    });
  }, []);

  const handleGenerate = useCallback((teamCount: number, mode: DivisionMode) => {
    setLastDivisionMode(mode);
    const newTeams = divideTeams(allMembers, teamCount, mode);
    setTeams(newTeams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseMembers, tempMembers]);

  const handleReshuffle = useCallback(() => {
    setTeams((prev) => divideTeams(allMembers, prev.length, lastDivisionMode));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseMembers, tempMembers, lastDivisionMode]);

  const handleRenameTeam = useCallback((teamId: string, newName: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, name: newName } : t))
    );
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    const [teamId, memberId] = id.split('::');
    const team = teams.find((t) => t.id === teamId);
    const member = team?.members.find((m) => m.id === memberId);
    setActiveMember(member ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveMember(null);

    const { active, over } = event;
    if (!over) return;

    const activeStr = String(active.id);
    const [fromTeamId, memberId] = activeStr.split('::');

    const overId = String(over.id);
    const toTeamId = overId.includes('::') ? overId.split('::')[0] : overId;

    if (fromTeamId === toTeamId) return;

    setTeams((prev) => moveMemberBetweenTeams(prev, memberId, fromTeamId, toTeamId));
  };

  const handleExportPdf = async () => {
    if (teams.length === 0) return;
    setIsExporting(true);
    try {
      await exportToPdf(teams);
    } finally {
      setIsExporting(false);
    }
  };

  const hasTeams = teams.length > 0;
  const managerCount = allMembers.filter((m) => m.isManager).length;

  const gridCols =
    teams.length <= 2 ? 'grid-cols-2' :
    teams.length <= 3 ? 'grid-cols-3' :
    teams.length <= 4 ? 'grid-cols-4' :
    teams.length <= 6 ? 'grid-cols-3' :
    'grid-cols-4';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">チーム分け自動ツール</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              マネージャー・盛り上げ役・部署を考慮してチームを自動生成します
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMgmt(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              メンバー管理
            </button>
            {hasTeams && (
              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    出力中...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDFダウンロード
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-4 self-start sticky top-24">
          <TeamSettings memberCount={allMembers.length} onGenerate={handleGenerate} />

          {/* 座席列数設定 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">座席レイアウト</h3>
            <label className="text-xs text-gray-500 mb-1.5 block">1行あたりの列数</label>
            <div className="flex gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setColumnsPerTeam(n)}
                  className={`w-9 h-9 text-sm font-bold rounded-lg border transition-colors ${
                    columnsPerTeam === n
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {n === 1 ? '≡' : n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {columnsPerTeam === 1
                ? 'リスト表示'
                : `${columnsPerTeam}列グリッド（座席表風）`}
            </p>
          </div>

          {/* アルゴリズム凡例 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700 mb-2">チーム分けルール</p>
            <p><span className="inline-block bg-blue-600 text-white px-1 rounded font-bold mr-1">MG</span>別チーム・席順1番に配置</p>
            <p><span className="mr-1">🔥</span>盛り上げ役は別チームに分散</p>
            <p><span className="mr-1">🏢</span>同部署が偏らないよう均等配分</p>
            {managerCount > 0 && (
              <p className="text-blue-600 font-medium">現在のMG数: {managerCount}人</p>
            )}
          </div>

          <AddMemberForm onAdd={handleAddTempMember} />
          <MemberList members={allMembers} onRemove={handleRemoveMember} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {!hasTeams ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-base font-medium">左のパネルでチーム設定を行い</p>
              <p className="text-gray-400 text-sm mt-1">「チームを作成」ボタンを押してください</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{teams.length}チーム</span>・合計{' '}
                  <span className="font-medium text-gray-700">
                    {teams.reduce((sum, t) => sum + t.members.length, 0)}人
                  </span>
                  ・ドラッグ＆ドロップで移動、チーム名クリックで編集
                </p>
                <button
                  onClick={handleReshuffle}
                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 px-3 py-1 rounded-lg transition-colors"
                >
                  再シャッフル
                </button>
              </div>

              <div className={`grid ${gridCols} gap-4`}>
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    activeId={activeId}
                    columnsPerTeam={columnsPerTeam}
                    onRename={handleRenameTeam}
                  />
                ))}
              </div>

              <DragOverlay>
                {activeMember && (
                  <div className={`flex items-center gap-2 p-2 rounded-lg border-2 border-blue-400 shadow-xl opacity-95 cursor-grabbing w-64
                    ${activeMember.isManager ? 'bg-blue-50' : 'bg-white'}`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center
                      ${activeMember.isManager ? 'bg-blue-600' : 'bg-gray-600'}`}
                    >
                      {activeMember.seatNumber}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        {activeMember.isManager && (
                          <span className="text-xs bg-blue-600 text-white px-1 rounded font-bold">MG</span>
                        )}
                        {activeMember.isTalkative && <span className="text-xs">🔥</span>}
                        <p className="text-sm font-medium text-gray-900">{activeMember.name}</p>
                      </div>
                      <p className="text-xs text-gray-500">{activeMember.department}</p>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </main>
      </div>

      {showMgmt && (
        <MemberManagementModal
          members={baseMembers}
          onClose={() => setShowMgmt(false)}
          onSave={handleSaveBaseMembers}
        />
      )}
    </div>
  );
}
