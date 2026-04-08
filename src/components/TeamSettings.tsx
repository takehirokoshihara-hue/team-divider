import { useState } from 'react';
import type { DivisionMode } from '../types';

interface TeamSettingsProps {
  memberCount: number;
  onGenerate: (teamCount: number, mode: DivisionMode) => void;
}

export function TeamSettings({ memberCount, onGenerate }: TeamSettingsProps) {
  const [mode, setMode] = useState<'teamCount' | 'perTeam'>('teamCount');
  const [teamCount, setTeamCount] = useState(4);
  const [perTeam, setPerTeam] = useState(5);
  const [divisionMode, setDivisionMode] = useState<DivisionMode>('spread');

  const handleGenerate = () => {
    if (mode === 'teamCount') {
      onGenerate(teamCount, divisionMode);
    } else {
      const count = Math.ceil(memberCount / perTeam);
      onGenerate(Math.max(1, count), divisionMode);
    }
  };

  const preview =
    mode === 'teamCount'
      ? `各チーム約 ${Math.ceil(memberCount / teamCount)}〜${Math.floor(memberCount / teamCount)}人`
      : `${Math.ceil(memberCount / perTeam)} チーム作成`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-700 mb-3 text-sm">チーム設定</h3>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode('teamCount')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            mode === 'teamCount'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          チーム数で指定
        </button>
        <button
          onClick={() => setMode('perTeam')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            mode === 'perTeam'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          人数で指定
        </button>
      </div>

      {mode === 'teamCount' ? (
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">チーム数</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={2}
              max={Math.min(16, memberCount)}
              value={teamCount}
              onChange={(e) => setTeamCount(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-blue-600 w-8 text-center">{teamCount}</span>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">1チームあたりの人数</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={2}
              max={Math.min(16, memberCount)}
              value={perTeam}
              onChange={(e) => setPerTeam(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-blue-600 w-8 text-center">{perTeam}</span>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mb-3">{preview}</p>

      {/* 分散/集中モード切り替え */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-1.5 block">部署配置モード</label>
        <div className="flex gap-2">
          <button
            onClick={() => setDivisionMode('spread')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
              divisionMode === 'spread'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
            }`}
          >
            🔀 分散モード
          </button>
          <button
            onClick={() => setDivisionMode('concentrate')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
              divisionMode === 'concentrate'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
            }`}
          >
            🏢 集中モード
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {divisionMode === 'spread'
            ? '同部署が別チームに分かれるよう均等配分'
            : '同部署が同チームにまとまるよう集中配置'}
        </p>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
      >
        チームを作成
      </button>
    </div>
  );
}
