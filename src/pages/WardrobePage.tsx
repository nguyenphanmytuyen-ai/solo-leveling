import React from 'react';
import { Sparkles, UserRound } from 'lucide-react';
import { useGame } from '../store/GameContext.js';
import { getCharacterXp } from '../domain/characterUnlocks.js';
import { SkinGrid } from '../components/game/SkinGrid.js';
import characters from '../data/characters.json' with { type: 'json' };

export const WardrobePage: React.FC = () => {
  const {state}=useGame();
  const xp=getCharacterXp(state);
  const current=characters.find(c=>c.id===state.profile.characterId)||characters[0];
  return <div className="skin-page">
    <header className="skin-page-header"><div className="skin-kicker"><Sparkles size={15}/> BẠN ĐỒNG HÀNH</div><h1>Chọn nhân vật</h1><p>Chọn một người bạn đồng hành cùng bạn chinh phục những mục tiêu mỗi ngày.</p></header>
    <section className="skin-current" aria-label="Nhân vật đang đồng hành"><div className="skin-current-icon"><UserRound size={20}/></div><div><span>ĐANG ĐỒNG HÀNH</span><strong>{current.displayName}</strong></div><span className="skin-current-xp">{xp.toLocaleString('vi-VN')} XP</span></section>
    <div className="skin-heading"><div><h2>Nhân vật của bạn</h2><p>Chạm vào nhân vật đã mở để thay đổi ngay.</p></div><span>{Math.min(xp,100)}/100 XP</span></div>
    <SkinGrid />
  </div>;
};
