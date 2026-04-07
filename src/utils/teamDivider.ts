import type { Member, Team, TeamMember } from '../types';

// 特例で同一チームOKなマネージャー名（マネージャー数>チーム数の場合）
const EXCEPTION_MANAGERS = ['渡辺 真梨奈', '布施 亜貴子'];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** チームごとの一時バケット */
interface TeamBucket {
  id: string;
  name: string;
  members: Member[];
}

/**
 * 優先度付き分散アルゴリズム
 *
 * 条件A: isManager=true は全員別チームに、席順1番目に配置
 * 条件B: マネージャー数>チーム数の場合のみ EXCEPTION_MANAGERS は同一チームOK
 * 条件C: isTalkative=true は必ず別チームに分散
 * 条件D: 同部署が偏らないよう均等分散
 */
export function divideTeams(members: Member[], teamCount: number): Team[] {
  if (teamCount <= 0 || members.length === 0) return [];

  const managers = shuffleArray(members.filter((m) => m.isManager));
  const talkativeNonMgr = shuffleArray(members.filter((m) => m.isTalkative && !m.isManager));
  const regular = shuffleArray(members.filter((m) => !m.isManager && !m.isTalkative));

  // チームバケットを初期化
  const buckets: TeamBucket[] = Array.from({ length: teamCount }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `チーム ${i + 1}`,
    members: [],
  }));

  // --- 条件A/B: マネージャーの配置 ---
  if (managers.length <= teamCount) {
    // 通常: 1チーム1マネージャー
    const indices = shuffleArray(Array.from({ length: teamCount }, (_, i) => i));
    managers.forEach((mgr, i) => buckets[indices[i]].members.push(mgr));
  } else {
    // 例外: マネージャー > チーム数
    // EXCEPTION_MANAGERSを除いた人を先にチームに配置
    const exceptionMgrs = managers.filter((m) => EXCEPTION_MANAGERS.includes(m.name));
    const normalMgrs = managers.filter((m) => !EXCEPTION_MANAGERS.includes(m.name));

    const indices = shuffleArray(Array.from({ length: teamCount }, (_, i) => i));
    // normalMgrs を各チームに 1人ずつ
    normalMgrs.forEach((mgr, i) => {
      const idx = indices[i % teamCount];
      buckets[idx].members.push(mgr);
    });
    // exceptionMgrs は最後のチームにまとめる
    const lastIdx = indices[teamCount - 1];
    exceptionMgrs.forEach((mgr) => buckets[lastIdx].members.push(mgr));
  }

  // --- 条件C: isTalkative の分散 ---
  for (const talkMember of talkativeNonMgr) {
    // talkative人数が最も少ないチームに配置（同数ならtotal人数が少ない方）
    buckets.sort((a, b) => {
      const aTalk = a.members.filter((m) => m.isTalkative).length;
      const bTalk = b.members.filter((m) => m.isTalkative).length;
      if (aTalk !== bTalk) return aTalk - bTalk;
      return a.members.length - b.members.length;
    });
    buckets[0].members.push(talkMember);
  }

  // --- 条件D: 部署分散（通常メンバー）---
  // 部署ごとにグループ化してラウンドロビン
  const deptMap = new Map<string, Member[]>();
  for (const m of regular) {
    if (!deptMap.has(m.department)) deptMap.set(m.department, []);
    deptMap.get(m.department)!.push(m);
  }

  // 部署グループをシャッフルして順番をランダム化
  const deptGroups = shuffleArray([...deptMap.values()]);

  for (const group of deptGroups) {
    for (const m of group) {
      // 同部署人数が最少 → 総人数が最少 のチームへ
      buckets.sort((a, b) => {
        const aSame = a.members.filter((x) => x.department === m.department).length;
        const bSame = b.members.filter((x) => x.department === m.department).length;
        if (aSame !== bSame) return aSame - bSame;
        return a.members.length - b.members.length;
      });
      buckets[0].members.push(m);
    }
  }

  // --- 席番号の割り当て: マネージャーは必ず1番 ---
  return buckets.map((bucket) => {
    const mgrMembers = bucket.members.filter((m) => m.isManager);
    const rest = shuffleArray(bucket.members.filter((m) => !m.isManager));
    const ordered = [...mgrMembers, ...rest];
    return {
      id: bucket.id,
      name: bucket.name,
      members: ordered.map((m, i) => ({ ...m, seatNumber: i + 1 })),
    };
  });
}

export function divideByMembersPerTeam(members: Member[], membersPerTeam: number): Team[] {
  const teamCount = Math.max(1, Math.ceil(members.length / membersPerTeam));
  return divideTeams(members, teamCount);
}

export function reassignSeatNumbers(team: Team): Team {
  const mgrMembers = team.members.filter((m) => m.isManager);
  const rest = team.members.filter((m) => !m.isManager);
  const ordered = [...mgrMembers, ...rest];
  return {
    ...team,
    members: ordered.map((m, i) => ({ ...m, seatNumber: i + 1 })),
  };
}

export function moveMemberBetweenTeams(
  teams: Team[],
  memberId: string,
  fromTeamId: string,
  toTeamId: string
): Team[] {
  let moved: TeamMember | undefined;

  const step1 = teams.map((team) => {
    if (team.id !== fromTeamId) return team;
    const filtered = team.members.filter((m) => {
      if (m.id === memberId) { moved = m; return false; }
      return true;
    });
    return reassignSeatNumbers({ ...team, members: filtered });
  });

  if (!moved) return teams;
  const movedMember = moved;

  return step1.map((team) => {
    if (team.id !== toTeamId) return team;
    const newMembers = [...team.members, { ...movedMember, seatNumber: team.members.length + 1 }];
    return reassignSeatNumbers({ ...team, members: newMembers });
  });
}
