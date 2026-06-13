"use client";

import React from 'react';
import { CharacterInfoCardType } from '@/types';
import useLocaleStore from '@/stores/localeStore';
import Image from 'next/image';
import ParseText from '../parseText';
import useDetailDataStore from '@/stores/detailDataStore';
import { getLocaleName } from '@/helper/getName';

export default function CharacterInfoCard({ character, selectedCharacters, onCharacterToggle }: { character: CharacterInfoCardType, selectedCharacters: CharacterInfoCardType[], onCharacterToggle: (characterId: CharacterInfoCardType) => void }) {
    const isSelected = selectedCharacters.some((selectedCharacter) => selectedCharacter.avatar_id === character.avatar_id);
    const { mapAvatar, mapLightCone, baseType, damageType } = useDetailDataStore();
    const { locale } = useLocaleStore();

    return (
        <div
            className={`bg-base-200/60 rounded-xl p-4 border cursor-pointer transition-all duration-200 ${isSelected
                ? 'border-blue-400 ring-2 ring-blue-400/50'
                : 'border-base-300/50 hover:border-base-300 opacity-75'
                }`}

            onClick={() => onCharacterToggle(character)}
        >

            {/* Character Portrait */}
            <div className="relative mb-4">
                <div className="w-full h-48 rounded-lg overflow-hidden relative">
                    <Image
                        src={`${process.env.CDN_URL}/${mapAvatar?.[character.avatar_id.toString()]?.Image?.AvatarIconPath}`}
                        alt={getLocaleName(locale, mapAvatar?.[character.avatar_id.toString()]?.Name)}
                        width={376}
                        height={512}
                        unoptimized
                        crossOrigin="anonymous"
                        className="w-full h-full object-contain"
                    />
                    <Image
                        width={48}
                        height={48}
                        unoptimized
                        crossOrigin="anonymous"
                        src={`${process.env.CDN_URL}/${damageType?.[mapAvatar?.[character.avatar_id.toString()]?.DamageType || ""]?.Icon}`}
                        className="absolute top-0 left-0 w-10 h-10 rounded-full"
                        alt={mapAvatar[character.avatar_id.toString()]?.DamageType.toLowerCase()}
                    />
                    <Image
                        width={48}
                        height={48}
                        unoptimized
                        crossOrigin="anonymous"
                        src={`${process.env.CDN_URL}/${baseType?.[mapAvatar?.[character.avatar_id.toString()]?.BaseType || ""]?.Icon}`}
                        className="absolute top-0 right-0 w-10 h-10 rounded-full"
                        alt={mapAvatar[character.avatar_id.toString()]?.BaseType.toLowerCase()}
                        style={{
                            boxShadow: "inset 0 0 8px 4px #9CA3AF"
                        }}
                    />
                </div>
            </div>

            {/* Character Name and Level */}
            <div className="w-full rounded-lg flex items-center justify-center mb-2">
                <div className="text-center">
                    <ParseText className="text-lg font-bold"
                        text={getLocaleName(locale, mapAvatar[character.avatar_id.toString()]?.Name)}
                        locale={locale}
                    />
                    <div className="text-base mb-1">Lv.{character.level}  E{character.rank}</div>
                </div>
            </div>
            {character.relics.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    {character.relics.map((relic, index) => (
                        <div key={index} className="relative">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-amber-500/50">
                                <Image
                                    src={`${process.env.CDN_URL}/spriteoutput/relicfigures/IconRelic_${relic.relic_set_id}_${relic.relic_id.toString()[relic.relic_id.toString().length - 1]}.png`}
                                    alt="Relic"
                                    unoptimized
                                    crossOrigin="anonymous"
                                    width={124}
                                    height={124}
                                    className="w-14 h-14 object-contain"
                                />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-1 rounded">
                                +{relic.level}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Light Cone */}
            {character.lightcone.item_id !== 0 && (
                <div className="">
                    <div className="rounded-lg h-42 flex items-center justify-center">
                        <Image
                            unoptimized
                            crossOrigin="anonymous"
                            src={`${process.env.CDN_URL}/${mapLightCone?.[character.lightcone.item_id.toString()]?.Image?.ImagePath}`}
                            alt={getLocaleName(locale, mapLightCone?.[character.lightcone.item_id.toString()]?.Name)}
                            width={348}
                            height={408}
                            className="w-full h-full object-contain rounded-lg"
                        />

                    </div>
                    <div className="w-full h-full rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-lg font-bold">
                                <ParseText
                                    text={getLocaleName(locale, mapLightCone[character.lightcone.item_id.toString()]?.Name)}
                                    locale={locale}
                                />
                            </div>
                            <div className="text-base mb-1">Lv.{character.lightcone.level}  S{character.lightcone.rank}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};