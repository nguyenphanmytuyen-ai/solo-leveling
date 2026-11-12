import React from 'react';
import { Check, LockKeyhole } from 'lucide-react';
import characters from '../../data/characters.json' with { type: 'json' };
import { useGame } from '../../store/GameContext.js';
import { canSelectCharacter, getCharacterXp } from '../../domain/characterUnlocks.js';

export const SkinGrid: React.FC = () => {
  const { state, dispatch } = useGame();
  const xp = getCharacterXp(state);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return <div className="skin-grid" aria-label="Chọn skin nhân vật">
    {characters.map((character) => {
      const locked = !canSelectCharacter(state, character.id);
      const selected = !locked && state.profile.characterId === character.id;
      return <button key={character.id} type="button" className={`skin-card ${locked ? 'is-locked' : ''} ${selected ? 'is-selected' : ''}`}
        disabled={locked} aria-pressed={selected} onClick={() => dispatch({type:'SET_PROFILE',payload:{characterId:character.id}})}>
        <span className="skin-card-top">{locked ? `${character.requiredXp} XP` : character.requiredXp ? 'Đã mở khóa' : 'Khởi đầu'}{selected && <Check size={16} aria-label="Đang chọn" />}</span>
        <span className="skin-image-wrap"><img src={`${base}/${character.idle.src.replace(/^\//,'')}`} alt="" className="skin-image" draggable={false} />{locked && <span className="skin-lock"><LockKeyhole size={22} /></span>}</span>
        <span className="skin-name">{character.displayName}</span>
        <span className="skin-status">{locked ? 'Đang khóa' : selected ? 'Đang đồng hành' : 'Chọn nhân vật'}</span>
        {locked && <span className="skin-progress"><span className="skin-progress-track"><span style={{width:`${Math.min(100, xp / character.requiredXp * 100)}%`}} /></span><span>{Math.min(xp,character.requiredXp)}/{character.requiredXp} XP</span></span>}
      </button>;
    })}
  </div>;
};
