"use client"
import Image from "next/image"
import { useMemo } from "react"
import CharacterCard from "../card/characterCard"
import useLocaleStore from "@/stores/localeStore"
import { useTranslations } from "next-intl"
import useDetailDataStore from "@/stores/detailDataStore"
import useCurrentDataStore from '@/stores/currentDataStore';
import { calcRarity, getNameChar } from "@/helper"

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
    } = useCurrentDataStore()
    const { mapAvatar, baseType, damageType } = useDetailDataStore()
    const transI18n = useTranslations("DataPage")
    const {locale} = useLocaleStore()

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
        <div className="grid grid-flow-row h-full auto-rows-max w-full">
            <div className="h-full rounded-lg mx-2 py-2">
                <div className="container">
                    <div className="flex flex-col h-full gap-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-center">
                                <input type="text"
                                    placeholder={transI18n("placeholderCharacter")}
                                    className="input input-bordered input-primary w-full"
                                    value={avatarSearch}
                                    onChange={(e) => setAvatarSearch(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-7 sm:grid-cols-4  lg:grid-cols-7 mb-1 mx-1 gap-2 w-full max-h-[17vh] min-h-[5vh] overflow-y-auto">
                                {Object.entries(damageType).filter(([key]) => key !== "").map(([key, value]) => (
                                    <div
                                        key={key}
                                        onClick={() => {
                                            setMapAvatarElementActive({ ...mapAvatarElementActive, [key]: !mapAvatarElementActive[key] })
                                        }}
                                        className="hover:bg-gray-600 grid items-center justify-items-center cursor-pointer rounded-md shadow-lg"
                                        style={{
                                            backgroundColor: mapAvatarElementActive[key] ? "#374151" : "#6B7280"
                                        }}>
                                        <Image
                                            src={`${process.env.CDN_URL}/${value.Icon}`}
                                            alt={key}
                                            unoptimized
                                            crossOrigin="anonymous"
                                            className="h-7 w-7 2xl:h-10 2xl:w-10 object-contain rounded-md"
                                            width={200}
                                            height={200} />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-9 sm:grid-cols-5 lg:grid-cols-9 mb-1 mx-1 gap-2 overflow-y-auto w-full max-h-[17vh] min-h-[5vh]">
                                {Object.entries(baseType).filter(([key]) => key !== "").map(([key, value]) => (
                                    <div
                                        key={key}
                                        onClick={() => {
                                            setMapAvatarPathActive({ ...mapAvatarPathActive, [key]: !mapAvatarPathActive[key] })
                                        }}
                                        className="hover:bg-gray-600 grid items-center justify-items-center rounded-md shadow-lg cursor-pointer"
                                        style={{
                                            backgroundColor: mapAvatarPathActive[key] ? "#374151" : "#6B7280"
                                        }}
                                    >

                                        <Image
                                            src={`${process.env.CDN_URL}/${value.Icon}`}
                                            unoptimized
                                            crossOrigin="anonymous"
                                            alt={key}
                                            className="h-7 w-7 2xl:h-10 2xl:w-10 object-contain rounded-md"
                                            width={200}
                                            height={200} />
                                    </div>
                                ))}

                            </div>
                        </div>

                        <div className="flex items-start h-full">
                            <ul className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full h-[65vh] overflow-y-scroll overflow-x-hidden">
                                {listAvatar.map((item, index) => (
                                    <div key={index} onClick={() => {
                                        setAvatarSelected(item);
                                        setSkillIDSelected(null)
                                        if (onClose) onClose()
                                    }}>
                                        <CharacterCard data={item} />
                                    </div>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
