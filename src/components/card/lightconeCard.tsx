"use client";

import { getLocaleName } from '@/helper';
import useLocaleStore from '@/stores/localeStore';
import ParseText from '../parseText';
import Image from 'next/image';
import { LightConeDetail } from '@/types';

interface LightconeCardProps {
    data: LightConeDetail
}

export default function LightconeCard({ data }: LightconeCardProps) {

    const { locale } = useLocaleStore();
    const text = getLocaleName(locale, data.Name)
    return (
        <li className="z-10 flex flex-col items-center rounded-md shadow-lg 
            bg-linear-to-b from-customStart to-customEnd transform transition-transform duration-300 
            hover:scale-105 cursor-pointer min-h-55"
        >
            <div
                className={`w-full rounded-md bg-linear-to-br ${data.Rarity === "CombatPowerLightconeRarity5"
                    ? "from-yellow-400 via-yellow-600/70 to-yellow-800/50"
                    : data.Rarity === "CombatPowerLightconeRarity4" ? "from-purple-400 via-purple-600/70 to-purple-800/50" :
                        "from-blue-400 via-blue-600/70 to-blue-800/50"
                    }`}
            >

                <div className="relative w-full h-full">
                    <Image
                        loading="lazy"
                        src={`${process.env.CDN_URL}/${data?.Image?.ThumbnailPath}`}
                        unoptimized
                        crossOrigin="anonymous"
                        width={348}
                        height={408}
                        className="w-full h-full rounded-md object-cover"
                        alt="ALT"
                    />
                </div>
            </div>

            <ParseText
                locale={locale}
                text={text}
                className="mt-2 px-1 text-center text-sm sm:text-base  font-bold leading-tight"
            />
        </li>

    );

}
