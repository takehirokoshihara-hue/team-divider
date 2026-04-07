import { useState } from 'react';
import type { Member } from '../types';
import { DEPARTMENTS } from '../data/members';

interface AddMemberFormProps {
  onAdd: (member: Omit<Member, 'id'>) => void;
}

export function AddMemberForm({ onAdd }: AddMemberFormProps) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [customDept, setCustomDept] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isTalkative, setIsTalkative] = useState(false);

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const dept = useCustom ? customDept.trim() : department;
    if (!name.trim() || !dept) return;
    onAdd({
      name: name.trim(),
      department: dept,
      isManager: isManager || undefined,
      isTalkative: isTalkative || undefined,
    });
    setName('');
    setCustomDept('');
    setIsManager(false);
    setIsTalkative(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-700 mb-3 text-sm">臨時メンバーを追加</h3>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="氏名"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <div className="flex items-center gap-2">
          {!useCustom ? (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={customDept}
              onChange={(e) => setCustomDept(e.target.value)}
              placeholder="部署名を入力"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required={useCustom}
            />
          )}
          <button
            type="button"
            onClick={() => setUseCustom(!useCustom)}
            className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap"
          >
            {useCustom ? '選択に戻す' : '手動入力'}
          </button>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isManager}
              onChange={(e) => setIsManager(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600"
            />
            マネージャー
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isTalkative}
              onChange={(e) => setIsTalkative(e.target.checked)}
              className="w-3.5 h-3.5 accent-orange-500"
            />
            盛り上げ役 🔥
          </label>
        </div>
        <button
          type="submit"
          className="w-full py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          追加
        </button>
      </div>
    </form>
  );
}
