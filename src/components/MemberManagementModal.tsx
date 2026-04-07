import { useState } from 'react';
import type { Member } from '../types';
import { DEPARTMENTS, generateMemberId } from '../data/members';

interface Props {
  members: Member[];
  onClose: () => void;
  onSave: (members: Member[]) => void;
}

type EditState = {
  id: string;
  name: string;
  department: string;
  isManager: boolean;
  isTalkative: boolean;
};

const EMPTY_EDIT: Omit<EditState, 'id'> = {
  name: '',
  department: DEPARTMENTS[0],
  isManager: false,
  isTalkative: false,
};

export function MemberManagementModal({ members, onClose, onSave }: Props) {
  const [list, setList] = useState<Member[]>(members);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<EditState, 'id'>>(EMPTY_EDIT);
  const [addForm, setAddForm] = useState<Omit<EditState, 'id'>>(EMPTY_EDIT);
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setEditForm({
      name: m.name,
      department: m.department,
      isManager: m.isManager ?? false,
      isTalkative: m.isTalkative ?? false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (!editForm.name.trim()) return;
    setList((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? {
              ...m,
              name: editForm.name.trim(),
              department: editForm.department,
              isManager: editForm.isManager || undefined,
              isTalkative: editForm.isTalkative || undefined,
            }
          : m
      )
    );
    setEditingId(null);
  };

  const removeMember = (id: string) => {
    setList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAdd = () => {
    if (!addForm.name.trim()) return;
    const newMember: Member = {
      id: generateMemberId(),
      name: addForm.name.trim(),
      department: addForm.department,
      isManager: addForm.isManager || undefined,
      isTalkative: addForm.isTalkative || undefined,
    };
    setList((prev) => [...prev, newMember]);
    setAddForm(EMPTY_EDIT);
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">固定メンバー管理</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{list.length}人</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium w-1/3">氏名</th>
                <th className="pb-2 font-medium w-1/3">部署</th>
                <th className="pb-2 font-medium text-center w-16">MG</th>
                <th className="pb-2 font-medium text-center w-16">盛上</th>
                <th className="pb-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) =>
                editingId === m.id ? (
                  <tr key={m.id} className="border-b border-blue-100 bg-blue-50">
                    <td className="py-2 pr-2">
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={editForm.department}
                        onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="checkbox"
                        checked={editForm.isManager}
                        onChange={(e) => setEditForm((f) => ({ ...f, isManager: e.target.checked }))}
                        className="w-4 h-4 accent-blue-600"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="checkbox"
                        checked={editForm.isTalkative}
                        onChange={(e) => setEditForm((f) => ({ ...f, isTalkative: e.target.checked }))}
                        className="w-4 h-4 accent-orange-500"
                      />
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={saveEdit}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        >
                          取消
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                    <td className="py-2 pr-2">
                      <span className="text-gray-800">{m.name}</span>
                    </td>
                    <td className="py-2 pr-2 text-gray-500 text-xs">{m.department}</td>
                    <td className="py-2 text-center">
                      {m.isManager && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">MG</span>
                      )}
                    </td>
                    <td className="py-2 text-center">
                      {m.isTalkative && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">🔥</span>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(m)}
                          className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => removeMember(m.id)}
                          className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Add form */}
          {isAdding ? (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-xs font-semibold text-green-700 mb-3">新しいメンバーを追加</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="氏名"
                  className="flex-1 min-w-32 px-3 py-1.5 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                />
                <select
                  value={addForm.department}
                  onChange={(e) => setAddForm((f) => ({ ...f, department: e.target.value }))}
                  className="flex-1 min-w-32 px-3 py-1.5 border border-green-300 rounded-lg text-sm bg-white focus:outline-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={addForm.isManager}
                    onChange={(e) => setAddForm((f) => ({ ...f, isManager: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  マネージャー
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={addForm.isTalkative}
                    onChange={(e) => setAddForm((f) => ({ ...f, isTalkative: e.target.checked }))}
                    className="w-4 h-4 accent-orange-500"
                  />
                  盛り上げ役
                </label>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAdd}
                  className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  追加
                </button>
                <button
                  onClick={() => { setIsAdding(false); setAddForm(EMPTY_EDIT); }}
                  className="px-4 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 w-full py-2 text-sm text-green-600 border-2 border-dashed border-green-300 rounded-xl hover:bg-green-50 transition-colors"
            >
              + メンバーを追加
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            キャンセル
          </button>
          <button
            onClick={() => onSave(list)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            保存して閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
