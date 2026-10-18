"use client"
import Image from "next/image"
import { useMemo } from "react"
import CharacterCard from "../card/characterCard"
import useLocaleStore from "@/stores/localeStore"
import { useTranslations } from "next-intl"
import useDetailDataStore from "@/stores/detailDataStore"
import useCurrentDataStore from '@/stores/currentDataStore';
import { calcRarity, getNameChar } from "@/helper"
import { useShallow } from "zustand/react/shallow";
import { Search, X } from "lucide-react"

export default function AvatarBar({ onClose }: { onClose?: () => void }) {
    const { 
        avatarSearch, 
        mapAvatarElementActive, 
        mapAvatarPathActive, 
        setAvatarSearch,
        setAvatarSelected,
        setMapAvatarElementActive, 
        setMapAvatarPathActive,
        setSkillIDSelected,
    } = useCurrentDataStore(
        useShallow((state) => ({
            avatarSearch: state.avatarSearch,
            mapAvatarElementActive: state.mapAvatarElementActive,
            mapAvatarPathActive: state.mapAvatarPathActive,
            setAvatarSearch: state.setAvatarSearch,
            setAvatarSelected: state.setAvatarSelected,
            setMapAvatarElementActive: state.setMapAvatarElementActive,
            setMapAvatarPathActive: state.setMapAvatarPathActive,
            setSkillIDSelected: state.setSkillIDSelected,
        }))
    )
    const { mapAvatar, baseType, damageType } = useDetailDataStore(
        useShallow((state) => ({
            mapAvatar: state.mapAvatar,
            baseType: state.baseType,
            damageType: state.damageType,
        }))
    )
    const transI18n = useTranslations("DataPage")
    const { locale } = useLocaleStore(
        useShallow((state) => ({ locale: state.locale }))
    )

    const listAvatar = useMemo(() => {
        if (!mapAvatar || !locale || !transI18n) return []

        let list = Object.values(mapAvatar)

        if (avatarSearch) {
            list = list.filter(item =>
                getNameChar(locale, transI18n, item)
                    .toLowerCase()
                    .includes(avatarSearch.toLowerCase())
            )
        }

        const allElementFalse = !Object.values(mapAvatarElementActive).some(v => v)
        const allPathFalse = !Object.values(mapAvatarPathActive).some(v => v)

        list = list.filter(item =>
            (allElementFalse || mapAvatarElementActive[item.DamageType]) &&
            (allPathFalse || mapAvatarPathActive[item.BaseType])
        )

        list.sort((a, b) => {
            const r = calcRarity(b.Rarity) - calcRarity(a.Rarity)
            if (r !== 0) return r
            return b.ID - a.ID
        })

        return list
    }, [mapAvatar, mapAvatarElementActive, mapAvatarPathActive, avatarSearch, locale, transI18n])

    return (
        <div className="flex flex-col h-full gap-2 p-2">
            {/* Compact Search Bar */}
            <label className="input input-sm input-bordered flex items-center gap-2 bg-base-200/90 border-base-300 rounded-xl w-full h-8.5 px-3 shadow-xs focus-within:border-primary/60 transition-colors">
                <Search className="w-4 h-4 text-base-content/70 shrink-0" />
                <input
                    type="text"
                    placeholder={transI18n("placeholderCharacter")}
                    className="grow text-xs bg-transparent border-none outline-none focus:outline-none placeholder:text-base-content/50"
                    value={avatarSearch}
                    onChange={(e) => setAvatarSearch(e.target.value)}
                />
                {avatarSearch && (
                    <button
                        type="button"
                        onClick={() => setAvatarSearch("")}
                        className="text-base-content/50 hover:text-base-content"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </label>

            {/* Compact Filter Section */}
            <div className="p-1 rounded-xl bg-base-200/80 border border-base-content/15 space-y-1 shadow-xs">
                {/* Element Filters - 7 Elements on 1 Row (gap-0.5) */}
                <div className="grid grid-cols-7 gap-0.5">
                    {Object.entries(damageType).filter(([key]) => key !== "").map(([key, value]) => {
                        const isActive = !!mapAvatarElementActive[key];
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => {
                                    setMapAvatarElementActive({ ...mapAvatarElementActive, [key]: !mapAvatarElementActive[key] })
                                }}
                                className={`h-8.5 w-full rounded-lg transition-all duration-150 active-press flex items-center justify-center p-0 ${
                                    isActive
                                        ? "bg-primary/20 text-primary ring-1.5 ring-primary scale-105 z-10 shadow-xs"
                                        : "hover:bg-base-100 opacity-90 hover:opacity-100"
                                }`}
                                title={(locale && value.Name?.[locale]) || key}
                            >
                                <Image
                                    src={`${process.env.CDN_URL}/${value.Icon}`}
                                    alt={key}
                                    unoptimized
                                    crossOrigin="anonymous"
                                    className="w-6.5 h-6.5 object-contain drop-shadow-xs"
                                    width={32}
                                    height={32}
                                />
                            </button>
                        );
                    })}
                </div>

                {/* Path Filters - 9 Paths on 1 Row (gap-0.5) */}
                <div className="grid grid-cols-9 gap-0.5">
                    {Object.entries(baseType).filter(([key]) => key !== "").map(([key, value]) => {
                        const isActive = !!mapAvatarPathActive[key];
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => {
                                    setMapAvatarPathActive({ ...mapAvatarPathActive, [key]: !mapAvatarPathActive[key] })
                                }}
                                className={`h-8 w-full rounded-lg transition-all duration-150 active-press flex items-center justify-center p-0 ${
                                    isActive
                                        ? "bg-primary/20 ring-1.5 ring-primary scale-105 z-10 shadow-xs"
                                        : "hover:bg-base-100 opacity-90 hover:opacity-100"
                                }`}
                                title={(locale && value.Text?.[locale]) || key}
                            >
                                <Image
                                    src={`${process.env.CDN_URL}/${value.Icon}`}
                                    unoptimized
                                    crossOrigin="anonymous"
                                    alt={key}
                                    className={`w-5.5 h-5.5 object-contain ${
                                        isActive ? "theme-path-icon-active" : "theme-path-icon"
                                    }`}
                                    width={28}
                                    height={28}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Character Count & Grid List */}
            <div className="flex items-center justify-between text-xs font-semibold text-base-content/80 px-1 py-0.5">
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span>{transI18n("character")}</span>
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {listAvatar.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-0.5 scrollbar-thin">
                <ul className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 auto-rows-fr">
                    {listAvatar.map((item, index) => (
                        <li
                            key={item.ID}
                            className="h-full flex flex-col"
                        >
                            <button
                                type="button"
                                className="h-full w-full text-left rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
                                onClick={() => {
                                    setAvatarSelected(item);
                                    setSkillIDSelected(null)
                                    if (onClose) onClose()
                                }}
                            >
                                <CharacterCard data={item} priority={index < 3} />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
