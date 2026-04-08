import type { Member, Team, TeamMember, DivisionMode } from '../types';

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

/** マネージャーをバケットに配置する共通処理 */
function placeManagers(managers: Member[], buckets: TeamBucket[]) {
  const teamCount = buckets.length;
  if (managers.length <= teamCount) {
    const indices = shuffleArray(Array.from({ length: teamCount }, (_, i) => i));
    managers.forEach((mgr, i) => buckets[indices[i]].members.push(mgr));
  } else {
    const exceptionMgrs = managers.filter((m) => EXCEPTION_MANAGERS.includes(m.name));
    const normalMgrs = managers.filter((m) => !EXCEPTION_MANAGERS.includes(m.name));
    const indices = shuffleArray(Array.from({ length: teamCount }, (_, i) => i));
    normalMgrs.forEach((mgr, i) => {
      buckets[indices[i % teamCount]].members.push(mgr);
    });
    const lastIdx = indices[teamCount - 1];
    exceptionMgrs.forEach((mgr) => buckets[lastIdx].members.push(mgr));
  }
}

/**
 * 分散モード（デフォルト）
 *
 * 条件A: isManager=true は全員別チームに、席順1番目に配置
 * 条件B: マネージャー数>チーム数の場合のみ EXCEPTION_MANAGERS は同一チームOK
 * 条件C: isTalkative=true は必ず別チームに分散
 * 条件D: 同部署が偏らないよう均等分散
 */
function divideTeamsSpread(members: Member[], teamCount: number): Team[] {
  const managers = shuffleArray(members.filter((m) => m.isManager));
  const talkativeNonMgr = shuffleArray(members.filter((m) => m.isTalkative && !m.isManager));
  const regular = shuffleArray(members.filter((m) => !m.isManager && !m.isTalkative));

  const buckets: TeamBucket[] = Array.from({ length: teamCount }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `チーム ${i + 1}`,
    members: [],
  }));

  placeManagers(managers, buckets);

  // --- 条件C: isTalkative の分散 ---
  for (const talkMember of talkativeNonMgr) {
    buckets.sort((a, b) => {
      const aTalk = a.members.filter((m) => m.isTalkative).length;
      const bTalk = b.members.filter((m) => m.isTalkative).length;
      if (aTalk !== bTalk) return aTalk - bTalk;
      return a.members.length - b.members.length;
    });
    buckets[0].members.push(talkMember);
  }

  // --- 条件D: 部署分散（通常メンバー）---
  const deptMap = new Map<string, Member[]>();
  for (const m of regular) {
    if (!deptMap.has(m.department)) deptMap.set(m.department, []);
    deptMap.get(m.department)!.push(m);
  }

  const deptGroups = shuffleArray([...deptMap.values()]);
  for (const group of deptGroups) {
    for (const m of group) {
      buckets.sort((a, b) => {
        const aSame = a.members.filter((x) => x.department === m.department).length;
        const bSame = b.members.filter((x) => x.department === m.department).length;
        if (aSame !== bSame) return aSame - bSame;
        return a.members.length - b.members.length;
      });
      buckets[0].members.push(m);
    }
  }

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

/**
 * 集中モード
 *
 * 同じ部署のメンバーが同じチームや近い席にまとまるよう配置する。
 * 大きい部署から順に1チームへ集中配置し、チームの定員を超える場合は
 * 次のチームに連続して配置することで部署の近接性を保つ。
 */
function divideTeamsConcentrate(members: Member[], teamCount: number): Team[] {
  const managers = shuffleArray(members.filter((m) => m.isManager));
  const nonManagers = members.filter((m) => !m.isManager);

  const buckets: TeamBucket[] = Array.from({ length: teamCount }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `チーム ${i + 1}`,
    members: [],
  }));

  placeManagers(managers, buckets);

  // 部署ごとにグループ化（大きい部署から順に処理）
  const deptMap = new Map<string, Member[]>();
  for (const m of nonManagers) {
    if (!deptMap.has(m.department)) deptMap.set(m.department, []);
    deptMap.get(m.department)!.push(m);
  }
  const deptGroups = shuffleArray([...deptMap.values()]).sort((a, b) => b.length - a.length);

  // 部署順に並べた全非マネージャーリスト（同部署が連続する）
  const orderedNonMgr = deptGroups.flat();

  // チームの非マネージャー目標人数を均等に算出
  const totalNonMgr = orderedNonMgr.length;
  const baseSize = Math.floor(totalNonMgr / teamCount);
  const extra = totalNonMgr % teamCount;
  const targetSizes = buckets.map((_, i) => baseSize + (i < extra ? 1 : 0));

  // 順番にチームへ詰め込む（部署が連続するため自然に集中配置される）
  let bucketIdx = 0;
  for (const m of orderedNonMgr) {
    while (bucketIdx < buckets.length - 1) {
      const nonMgrCount = buckets[bucketIdx].members.filter((x) => !x.isManager).length;
      if (nonMgrCount < targetSizes[bucketIdx]) break;
      bucketIdx++;
    }
    buckets[bucketIdx].members.push(m);
  }

  // 席番号の割り当て（部署でソートして同部署が隣接するように）
  return buckets.map((bucket) => {
    const mgrMembers = bucket.members.filter((m) => m.isManager);
    const rest = [...bucket.members.filter((m) => !m.isManager)].sort((a, b) =>
      a.department.localeCompare(b.department)
    );
    const ordered = [...mgrMembers, ...rest];
    return {
      id: bucket.id,
      name: bucket.name,
      members: ordered.map((m, i) => ({ ...m, seatNumber: i + 1 })),
    };
  });
}

/**
 * モードを指定してチーム分けを実行するメイン関数
 */
export function divideTeams(
  members: Member[],
  teamCount: number,
  mode: DivisionMode = 'spread'
): Team[] {
  if (teamCount <= 0 || members.length === 0) return [];
  return mode === 'concentrate'
    ? divideTeamsConcentrate(members, teamCount)
    : divideTeamsSpread(members, teamCount);
}

export function divideByMembersPerTeam(
  members: Member[],
  membersPerTeam: number,
  mode: DivisionMode = 'spread'
): Team[] {
  const teamCount = Math.max(1, Math.ceil(members.length / membersPerTeam));
  return divideTeams(members, teamCount, mode);
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
