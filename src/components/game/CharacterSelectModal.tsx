import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useGame } from '../../store/GameContext.js';
import { sanitizeCharacterInput, validateCharacterName } from '../../domain/character.js';
import { SkinGrid } from './SkinGrid.js';

interface CharacterSelectModalProps {isOpen:boolean;onClose?:()=>void;title?:string;subtitle?:string;}
export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({isOpen,onClose,title='Chọn bạn đồng hành',subtitle='Chọn một nhân vật để cùng bạn hoàn thành mục tiêu mỗi ngày.'}) => {
  const {state,dispatch}=useGame();
  const [nickname,setNickname]=useState(state.profile.nickname||'');
  const [error,setError]=useState('');
  useEffect(()=>{if(isOpen){setNickname(state.profile.nickname||'');setError('');}},[isOpen]);
  if(!isOpen) return null;
  const confirm=()=>{const result=validateCharacterName(nickname);if(!result.isValid){setError(result.error||'Vui lòng nhập biệt danh.');return;}dispatch({type:'SET_PROFILE',payload:{nickname:result.cleanName}});onClose?.();};
  return <div className="skin-modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
    <div className="skin-modal"><header className="skin-modal-header"><div><h2>{title}</h2><p>{subtitle}</p></div>{onClose && <button type="button" aria-label="Đóng cửa sổ" className="skin-modal-close" onClick={onClose}><X size={20}/></button>}</header>
      <div className="skin-modal-body"><label className="skin-nickname">Tên nhân vật / Biệt danh<input value={nickname} maxLength={20} onChange={e=>{setNickname(sanitizeCharacterInput(e.target.value));setError('');}} placeholder="Nhập biệt danh của bạn" /></label>{error && <p className="skin-error" role="alert">{error}</p>}<SkinGrid /></div>
      <footer className="skin-modal-footer">{onClose && <button type="button" onClick={onClose}>Đóng</button>}<button type="button" className="skin-confirm" onClick={confirm}>Xác nhận</button></footer>
    </div>
  </div>;
};
