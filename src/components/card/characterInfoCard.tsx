"use client";

import React from 'react';
import { CharacterInfoCardType } from '@/types';
import useLocaleStore from '@/stores/localeStore';
import Image from 'next/image';
import ParseText from '../parseText';
import useDetailDataStore from '@/stores/detailDataStore';
import { getLocaleName } from '@/helper/getName';
import { useShallow } from 'zustand/react/shallow';

export default function CharacterInfoCard({ 
    character, 
    selectedCharacters, 
    onCharacterToggle 
}: { 
    character: CharacterInfoCardType, 
    selectedCharacters: CharacterInfoCardType[], 
    onCharacterToggle: (characterId: CharacterInfoCardType) => void 
}) {
    const isSelected = selectedCharacters.some((selectedCharacter) => selectedCharacter.avatar_id === character.avatar_id);
    const { mapAvatar, mapLightCone, baseType, damageType } = useDetailDataStore(
        useShallow((state) => ({
            mapAvatar: state.mapAvatar,
            mapLightCone: state.mapLightCone,
            baseType: state.baseType,
            damageType: state.damageType,
        }))
    );
    const { locale } = useLocaleStore(
        useShallow((state) => ({ locale: state.locale }))
    );

    const avatar = mapAvatar?.[character.avatar_id.toString()];

    return (
        <div
            className={`group rounded-2xl p-4 border transition-all duration-200 cursor-pointer select-none ${
                isSelected
                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/40'
                    : 'bg-base-200/60 border-white/5 hover:border-white/20 opacity-80 hover:opacity-100 hover:bg-base-200'
            }`}
            onClick={() => onCharacterToggle(character)}
        >
            {/* Character Portrait */}
            <div className="relative mb-3 aspect-4/5 rounded-xl overflow-hidden bg-base-300/40 flex items-center justify-center">
                {avatar && (
                    <>
                        <Image
                            src={`${process.env.CDN_URL}/${avatar.Image?.AvatarIconPath}`}
                            alt={getLocaleName(locale, avatar.Name)}
                            width={376}
                            height={512}
                            unoptimized
                            crossOrigin="anonymous"
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        {damageType?.[avatar.DamageType]?.Icon && (
                            <div className="absolute top-1.5 left-1.5 p-0.5 rounded-full bg-black/60 backdrop-blur-xs border border-white/10">
                                <Image
                                    width={24}
                                    height={24}
                                    unoptimized
                                    crossOrigin="anonymous"
                                    src={`${process.env.CDN_URL}/${damageType[avatar.DamageType].Icon}`}
                                    className="w-5 h-5 object-contain"
                                    alt={avatar.DamageType.toLowerCase()}
                                />
                            </div>
                        )}
                        {baseType?.[avatar.BaseType]?.Icon && (
                            <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-black/60 backdrop-blur-xs border border-white/10">
                                <Image
                                    width={24}
                                    height={24}
                                    unoptimized
                                    crossOrigin="anonymous"
                                    src={`${process.env.CDN_URL}/${baseType[avatar.BaseType].Icon}`}
                                    className="w-5 h-5 object-contain"
                                    alt={avatar.BaseType.toLowerCase()}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Character Name and Level Badge */}
            <div className="text-center mb-3">
                <ParseText 
                    className="text-base font-bold line-clamp-1"
                    text={avatar ? getLocaleName(locale, avatar.Name) : character.avatar_id.toString()}
                    locale={locale}
                />
                <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-base-300/80 text-base-content/80">
                        Lv.{character.level}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        E{character.rank}
                    </span>
                </div>
            </div>

            {/* Relics Mini-grid */}
            {character.relics.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 p-1.5 rounded-xl bg-base-100/50 border border-white/5">
                    {character.relics.map((relic, index) => (
                        <div key={index} className="relative group/relic">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-base-200 border border-amber-500/40">
                                <Image
                                    src={`${process.env.CDN_URL}/spriteoutput/relicfigures/IconRelic_${relic.relic_set_id}_${relic.relic_id.toString()[relic.relic_id.toString().length - 1]}.png`}
                                    alt="Relic"
                                    unoptimized
                                    crossOrigin="anonymous"
                                    width={32}
                                    height={32}
                                    className="w-6 h-6 object-contain"
                                />
                            </div>
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-black/80 text-[9px] font-mono font-bold text-amber-400 px-1 rounded-full border border-white/10">
                                +{relic.level}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Light Cone */}
            {character.lightcone && character.lightcone.item_id !== 0 && (
                <div className="p-2 rounded-xl bg-base-100/50 border border-white/5 text-center">
                    <div className="h-28 flex items-center justify-center mb-1">
                        <Image
                            unoptimized
                            crossOrigin="anonymous"
                            src={`${process.env.CDN_URL}/${mapLightCone?.[character.lightcone.item_id.toString()]?.Image?.ImagePath}`}
                            alt="Lightcone"
                            width={160}
                            height={200}
                            className="h-full w-auto object-contain rounded-lg"
                        />
                    </div>
                    <div className="text-xs font-bold truncate">
                        <ParseText
                            text={getLocaleName(locale, mapLightCone?.[character.lightcone.item_id.toString()]?.Name)}
                            locale={locale}
                        />
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-[11px] font-mono text-base-content/70">Lv.{character.lightcone.level}</span>
                        <span className="text-[11px] font-mono font-bold text-primary">S{character.lightcone.rank}</span>
                    </div>
                </div>
            )}
        </div>
    );
};