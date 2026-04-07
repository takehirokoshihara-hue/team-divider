import type { Member } from '../types';

export const DEFAULT_MEMBERS: Omit<Member, 'id'>[] = [
  { department: 'CEO', name: '中島 功之祐', isManager: true },
  { department: 'AnyReach 1to1', name: '川田 篤広', isManager: true },
  { department: 'Delivery', name: '川名 英介', isTalkative: true },
  { department: 'Delivery', name: '稲田 あかり' },
  { department: 'Delivery', name: '林 亮佑' },
  { department: 'Delivery', name: '八木 神威' },
  { department: 'Delivery', name: '渋谷 春樹' },
  { department: 'Delivery', name: '大島 理歩' },
  { department: 'Marketing', name: '岡村 陵矢' },
  { department: 'BizDev/FDE', name: '富澤 陽仁' },
  { department: 'BizDev/FDE', name: '佐藤 裕基' },
  { department: 'BizDev/FS', name: '山崎 愛美', isManager: true },
  { department: 'BizDev/FS', name: '岡部 華奈', isTalkative: true },
  { department: 'BizDev/FS', name: '水上 真里' },
  { department: 'BizDev/FS', name: '木村 江梨花' },
  { department: 'BizDev/FS', name: '知野 敬太' },
  { department: 'BizDev/FS', name: '飽浦 麻未' },
  { department: 'Customer Success/PM', name: '井上 翔太', isManager: true },
  { department: 'Customer Success/PM', name: '巽 愛菜', isTalkative: true },
  { department: 'Customer Success/PM', name: '小田根 祐花' },
  { department: 'Customer Success/PM', name: '林 真人' },
  { department: 'Customer Success/PM', name: '醍醐 伸岳' },
  { department: 'Customer Success/PM', name: '佐竹 陽由梧' },
  { department: 'Customer Success/PM', name: '腰原 武拓', isTalkative: true },
  { department: 'Account Management', name: '松山 胡桃', isManager: true },
  { department: 'Account Management', name: '陣内 希海', isTalkative: true },
  { department: 'Account Management', name: '酒井 花苑' },
  { department: 'Customer Support', name: '布施 亜貴子' },
  { department: 'Product', name: '百瀬 凌也' },
  { department: 'Engineering', name: '垣地 優輔' },
  { department: 'Design', name: '三芳 日向子' },
  { department: 'Corporate/HR & GA', name: '渡辺 真梨奈' },
];

let _idSeed = 0;
export function generateMemberId(): string {
  return `member-${Date.now()}-${_idSeed++}`;
}

export function createInitialMembers(): Member[] {
  return DEFAULT_MEMBERS.map((m) => ({ ...m, id: generateMemberId() }));
}

export const DEPARTMENTS = [
  'CEO',
  'AnyReach 1to1',
  'Delivery',
  'Marketing',
  'BizDev/FDE',
  'BizDev/FS',
  'Customer Success/PM',
  'Account Management',
  'Customer Support',
  'Product',
  'Engineering',
  'Design',
  'Corporate/HR & GA',
] as const;

export type DepartmentName = typeof DEPARTMENTS[number];
