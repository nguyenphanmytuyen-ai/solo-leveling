import React from 'react';
import characters from '../../data/characters.json' with { type: 'json' };
interface CharacterSpriteProps {characterId:string;isCelebrating?:boolean;scale?:number;className?:string;}
export const CharacterSprite: React.FC<CharacterSpriteProps> = ({characterId,isCelebrating=false,scale=1,className=''}) => {
  const character=characters.find(c=>c.id===characterId)||characters[0];
  const base=import.meta.env.BASE_URL.replace(/\/$/,'');
  return <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`} style={{transform:`scale(${scale*(character.stage?.scale||.9)})`}}><img src={`${base}/${character.idle.src.replace(/^\//,'')}`} alt={character.displayName} draggable={false} className={`w-full h-full object-contain pointer-events-none pixelated ${isCelebrating?'animate-celebrate-bounce':''}`} /></div>;
};
