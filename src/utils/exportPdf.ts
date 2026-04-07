import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Team } from '../types';

// 部署カラーマップ (背景色 / テキスト色)
const DEPT_STYLE: Record<string, { bg: string; text: string }> = {
  'CEO':                   { bg: '#ede9fe', text: '#5b21b6' },
  'AnyReach 1to1':         { bg: '#fce7f3', text: '#9d174d' },
  'Delivery':              { bg: '#dbeafe', text: '#1e40af' },
  'Marketing':             { bg: '#ffedd5', text: '#9a3412' },
  'BizDev/FDE':            { bg: '#d1fae5', text: '#065f46' },
  'BizDev/FS':             { bg: '#ccfbf1', text: '#0f766e' },
  'Customer Success/PM':   { bg: '#e0f2fe', text: '#0369a1' },
  'Account Management':    { bg: '#ede9fe', text: '#4c1d95' },
  'Customer Support':      { bg: '#ffe4e6', text: '#9f1239' },
  'Product':               { bg: '#fef3c7', text: '#92400e' },
  'Engineering':           { bg: '#cffafe', text: '#164e63' },
  'Design':                { bg: '#fae8ff', text: '#86198f' },
  'Corporate/HR & GA':     { bg: '#ecfccb', text: '#365314' },
};

function getDeptStyle(dept: string) {
  return DEPT_STYLE[dept] ?? { bg: '#f3f4f6', text: '#374151' };
}

function px(mm: number, dpi = 96): number {
  return Math.round(mm * (dpi / 25.4));
}

/**
 * DOM要素を直接構築して canvas に描画することで
 * フォントレンダリング・文字ズレを防ぐ。
 * scale=3 で高解像度出力。
 */
export async function exportToPdf(teams: Team[]) {
  // A4 landscape: 297 x 210 mm
  const PDF_W_MM = 297;
  const PDF_H_MM = 210;
  const SCALE = 3;
  const PX_W = px(PDF_W_MM) * SCALE;
  const PX_H = px(PDF_H_MM) * SCALE;

  const cols = Math.min(teams.length, 4);
  const rows = Math.ceil(teams.length / cols);

  // コンテナ生成
  const container = document.createElement('div');
  Object.assign(container.style, {
    position:        'fixed',
    top:             '-99999px',
    left:            '-99999px',
    width:           `${PX_W}px`,
    height:          `${PX_H}px`,
    backgroundColor: '#f8fafc',
    padding:         `${SCALE * 20}px`,
    boxSizing:       'border-box',
    fontFamily:      "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif",
    display:         'flex',
    flexDirection:   'column',
    gap:             `${SCALE * 10}px`,
    overflow:        'hidden',
  });

  // タイトル行
  const titleBar = document.createElement('div');
  Object.assign(titleBar.style, {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    flexShrink:     '0',
  });
  const titleEl = document.createElement('div');
  Object.assign(titleEl.style, {
    fontSize:   `${SCALE * 14}px`,
    fontWeight: '800',
    color:      '#0f172a',
    letterSpacing: '-0.5px',
  });
  titleEl.textContent = 'チーム分け結果';
  const metaEl = document.createElement('div');
  Object.assign(metaEl.style, {
    fontSize: `${SCALE * 9}px`,
    color:    '#94a3b8',
  });
  const total = teams.reduce((s, t) => s + t.members.length, 0);
  metaEl.textContent = `${teams.length}チーム・${total}人`;
  titleBar.appendChild(titleEl);
  titleBar.appendChild(metaEl);
  container.appendChild(titleBar);

  // チームグリッド
  const grid = document.createElement('div');
  Object.assign(grid.style, {
    display:             'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows:    `repeat(${rows}, 1fr)`,
    gap:                 `${SCALE * 8}px`,
    flex:                '1',
    overflow:            'hidden',
  });

  for (const team of teams) {
    const card = document.createElement('div');
    Object.assign(card.style, {
      backgroundColor: '#ffffff',
      borderRadius:    `${SCALE * 8}px`,
      border:          `${SCALE * 1.5}px solid #e2e8f0`,
      padding:         `${SCALE * 10}px`,
      display:         'flex',
      flexDirection:   'column',
      gap:             `${SCALE * 4}px`,
      overflow:        'hidden',
      breakInside:     'avoid',
      pageBreakInside: 'avoid',
    });

    // チームヘッダー
    const header = document.createElement('div');
    Object.assign(header.style, {
      display:         'flex',
      alignItems:      'baseline',
      justifyContent:  'space-between',
      paddingBottom:   `${SCALE * 5}px`,
      borderBottom:    `${SCALE * 2}px solid #bfdbfe`,
      flexShrink:      '0',
    });
    const teamName = document.createElement('span');
    Object.assign(teamName.style, {
      fontSize:    `${SCALE * 11}px`,
      fontWeight:  '700',
      color:       '#1e40af',
      whiteSpace:  'nowrap',
    });
    teamName.textContent = team.name;
    const memberCount = document.createElement('span');
    Object.assign(memberCount.style, {
      fontSize: `${SCALE * 8}px`,
      color:    '#94a3b8',
    });
    memberCount.textContent = `${team.members.length}人`;
    header.appendChild(teamName);
    header.appendChild(memberCount);
    card.appendChild(header);

    // メンバーリスト
    const memberList = document.createElement('div');
    Object.assign(memberList.style, {
      display:       'flex',
      flexDirection: 'column',
      gap:           `${SCALE * 3}px`,
      overflow:      'hidden',
    });

    for (const member of team.members) {
      const row = document.createElement('div');
      Object.assign(row.style, {
        display:     'flex',
        alignItems:  'center',
        gap:         `${SCALE * 5}px`,
        breakInside: 'avoid',
      });

      // 席番号バッジ
      const badge = document.createElement('span');
      Object.assign(badge.style, {
        width:           `${SCALE * 16}px`,
        height:          `${SCALE * 16}px`,
        borderRadius:    '50%',
        backgroundColor: member.isManager ? '#2563eb' : '#475569',
        color:           '#ffffff',
        fontSize:        `${SCALE * 8}px`,
        fontWeight:      '700',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        flexShrink:      '0',
      });
      badge.textContent = String(member.seatNumber);
      row.appendChild(badge);

      // MGバッジ
      if (member.isManager) {
        const mgBadge = document.createElement('span');
        Object.assign(mgBadge.style, {
          backgroundColor: '#2563eb',
          color:           '#ffffff',
          fontSize:        `${SCALE * 7}px`,
          fontWeight:      '700',
          padding:         `${SCALE * 1}px ${SCALE * 3}px`,
          borderRadius:    `${SCALE * 2}px`,
          flexShrink:      '0',
          lineHeight:      '1.2',
        });
        mgBadge.textContent = 'MG';
        row.appendChild(mgBadge);
      }

      // 盛り上げ役
      if (member.isTalkative) {
        const talkBadge = document.createElement('span');
        Object.assign(talkBadge.style, {
          fontSize:  `${SCALE * 9}px`,
          flexShrink:'0',
        });
        talkBadge.textContent = '🔥';
        row.appendChild(talkBadge);
      }

      // 氏名
      const name = document.createElement('span');
      Object.assign(name.style, {
        fontSize:     `${SCALE * 10}px`,
        fontWeight:   member.isManager ? '700' : '500',
        color:        '#0f172a',
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
        flex:         '1',
        letterSpacing: '-0.2px',
      });
      name.textContent = member.name;
      row.appendChild(name);

      // 部署バッジ
      const { bg, text } = getDeptStyle(member.department);
      const deptBadge = document.createElement('span');
      Object.assign(deptBadge.style, {
        backgroundColor: bg,
        color:           text,
        fontSize:        `${SCALE * 7}px`,
        fontWeight:      '600',
        padding:         `${SCALE * 1.5}px ${SCALE * 4}px`,
        borderRadius:    `${SCALE * 10}px`,
        whiteSpace:      'nowrap',
        flexShrink:      '0',
        maxWidth:        `${SCALE * 70}px`,
        overflow:        'hidden',
        textOverflow:    'ellipsis',
      });
      deptBadge.textContent = member.department;
      row.appendChild(deptBadge);

      memberList.appendChild(row);
    }

    card.appendChild(memberList);
    grid.appendChild(card);
  }

  container.appendChild(grid);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 1, // コンテナ自体がSCALE倍なのでscale=1
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f8fafc',
      logging: false,
      imageTimeout: 0,
    });

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, PDF_W_MM, PDF_H_MM);
    pdf.save('チーム分け結果.pdf');
  } finally {
    document.body.removeChild(container);
  }
}
