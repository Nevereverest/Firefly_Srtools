"use client"

import { useMemo } from "react"
import Image from "next/image";
import useLocaleStore from "@/stores/localeStore"
import LightconeCard from "../card/lightconeCard";
import useUserDataStore from "@/stores/userDataStore";
import useModelStore from "@/stores/modelStore";
import { useTranslations } from "next-intl";
import useCurrentDataStore from "@/stores/currentDataStore";
import useDetailDataStore from "@/stores/detailDataStore";
import { calcRarity, getLocaleName } from "@/helper";

export default function LightconeBar() {
    const { locale } = useLocaleStore()
    const {
        avatarSelected,
        mapLightconePathActive,
        mapLightconeRankActive,
        setMapLightconePathActive,
        setMapLightconeRankActive,
        lightconeSearch,
        setLightconeSearch
    } = useCurrentDataStore()
    const { setAvatar, avatars } = useUserDataStore()
    const { setIsOpenLightcone } = useModelStore()
    const { mapLightCone, baseType } = useDetailDataStore()
    const transI18n = useTranslations("DataPage")

    const listLightcone = useMemo(() => {
        if (!mapLightCone || !locale) return []

        let list = Object.values(mapLightCone)

        if (lightconeSearch) {
            list = list.filter(item => getLocaleName(locale, item.Name).toLowerCase().includes(lightconeSearch.toLowerCase()))
        }

        const allRankFalse = !Object.values(mapLightconeRankActive).some(v => v)
        const allPathFalse = !Object.values(mapLightconePathActive).some(v => v)

        list = list.filter(item =>
            (allRankFalse || mapLightconeRankActive[item.Rarity]) &&
            (allPathFalse || mapLightconePathActive[item.BaseType])
        )
        
        list.sort((a, b) => {
            const r = calcRarity(b.Rarity) - calcRarity(a.Rarity)
            if (r !== 0) return r
            return b.ID - a.ID
        })

        return list
    }, [mapLightCone, mapLightconePathActive, mapLightconeRankActive, lightconeSearch, locale])

  

    return (
        <div>
            <div className="border-b border-purple-500/30 px-6 py-4 mb-4">
                <h3 className="font-bold text-2xl text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-cyan-400">
                    {transI18n("lightConeSetting")}
                </h3>
            </div>
            <div className="mt-2 w-full">
                <div className="flex items-start flex-col gap-2">
                    <div>Search</div>
                    <input
                        value={lightconeSearch}
                        onChange={(e) => setLightconeSearch(e.target.value)}
                        type="text" placeholder="LightCone Name" className="input input-accent mt-1 w-full"
                    />
                </div>
                <div className="flex items-start flex-col gap-2 mt-2 w-full">
                    <div>Filter</div>
                    <div className="flex flex-row flex-wrap justify-between mt-1 w-full">
                        <div className="flex flex-wrap mb-1 mx-1 gap-2">
                            {Object.entries(baseType).filter(([key]) => key !== "").map(([key, value]) => (
                                <div
                                    key={key}
                                    onClick={() => {
                                        setMapLightconePathActive({ ...mapLightconePathActive, [key]: !mapLightconePathActive[key] })
                                    }}
                                    className="h-9.5 w-9.5 md:h-12.5 md:w-12.5 hover:bg-gray-600 grid place-items-center rounded-md shadow-lg cursor-pointer"
                                    style={{
                                        backgroundColor: mapLightconePathActive[key] ? "#374151" : "#6B7280"
                                    }}
                                >
                                    <Image
                                        unoptimized
                                        crossOrigin="anonymous"
                                        src={`${process.env.CDN_URL}/${value.Icon}`}
                                        alt={key}
                                        className="h-7 w-7 md:h-8 md:w-8 object-contain rounded-md"
                                        width={200}
                                        height={200}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap mb-1 mx-1 gap-2">
                            {Object.keys(mapLightconeRankActive).map((key, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        setMapLightconeRankActive({ ...mapLightconeRankActive, [key]: !mapLightconeRankActive[key] })
                                    }}
                                    className="h-9.5 w-9.5 md:h-12.5 md:w-12.5 hover:bg-gray-600 grid place-items-center rounded-md shadow-lg cursor-pointer"
                                    style={{
                                        backgroundColor: mapLightconeRankActive[key] ? "#374151" : "#6B7280"
                                    }}
                                >
                                    <div className="font-bold text-white h-8 w-8 text-center flex items-center justify-center">
                                        {key}*
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 mt-2 gap-2">
                {listLightcone.map((item, index) => (
                    <div key={index} onClick={() => {
                        if (avatarSelected) {
                            const avatar = avatars[avatarSelected?.ID?.toString()]
                            avatar.profileList[avatar.profileSelect].lightcone = {
                                level: 80,
                                item_id: item.ID,
                                rank: 1,
                                promotion: 6
                            }
                            setAvatar({ ...avatar })
                            setIsOpenLightcone(false)
                        }
                    }}>
                        <LightconeCard data={item} />
                    </div>
                ))}
            </div>
        </div>
    )
}