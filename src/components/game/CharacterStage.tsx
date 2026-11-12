import React from 'react';
import { useGame } from '../../store/GameContext.js';
import { CharacterSprite } from './CharacterSprite.js';
import characters from '../../data/characters.json' with { type: 'json' };
interface CharacterStageProps {characterId?:string;size?:'mini'|'xs'|'sm'|'md'|'lg';className?:string;previewCosmetics?:Partial<Record<string,string>>;showNameplate?:boolean;allowAdjustment?:boolean;characterScaleMultiplier?:number;}
export const CharacterStage:React.FC<CharacterStageProps>=({characterId,size='md',className='',showNameplate=false,characterScaleMultiplier=1})=>{
 const {state,isCelebrating}=useGame();const id=characterId||state.profile.characterId||'hero';const char=characters.find(c=>c.id===id)||characters[0];
 const sizes={mini:'w-10 h-10 rounded-full',xs:'w-12 h-12 rounded-xl',sm:'w-24 h-24 rounded-xl',md:'w-48 h-48 sm:w-56 sm:h-56 rounded-2xl',lg:'w-64 h-64 sm:w-80 sm:h-80 rounded-3xl'};
 return <div className={`flex flex-col items-center ${className}`}><div className={`relative shrink-0 overflow-hidden border border-cyan-300/20 bg-[#142338] flex items-center justify-center ${sizes[size]}`} aria-label={`Avatar nhân vật ${char.displayName}`}><CharacterSprite characterId={id} isCelebrating={isCelebrating} scale={(size==='mini'?.9:size==='sm'?.75:size==='xs'?.52:1)*characterScaleMultiplier}/></div>{showNameplate&&<span className="text-sm font-semibold text-slate-100 mt-2">{char.displayName}</span>}</div>;
};
