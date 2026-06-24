"use client";
import { getNameChar } from '@/helper';
import useLocaleStore from '@/stores/localeStore';
import { AvatarDetail } from '@/types';
import ParseText from '../parseText';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import useDetailDataStore from '@/stores/detailDataStore';

interface CharacterCardProps {
  data: AvatarDetail
}

export default function CharacterCard({ data }: CharacterCardProps) {
  const { locale } = useLocaleStore();
  const transI18n = useTranslations("DataPage");
  const { baseType, damageType } = useDetailDataStore()

  return (
    <li
      className="z-10 flex flex-col items-center rounded-xl shadow-xl 
               bg-linear-to-br from-base-300 via-base-100 to-warning/70
               transform transition-transform duration-300 ease-in-out 
               hover:scale-105 cursor-pointer min-h-45 sm:min-h-45 md:min-h-52.5 lg:min-h-55 xl:min-h-60 2xl:min-h-65"
    >
      <div
        className={`w-full rounded-md bg-linear-to-br ${data.Rarity === "CombatPowerAvatarRarityType5"
          ? "from-yellow-400 via-yellow-600/70 to-yellow-800/50"
          : "from-purple-400 via-purple-600/70 to-purple-800/50"
          }`}
      >

        <div className="relative w-full h-32 lg:h-26 xl:h-36">
          <Image
            width={376}
            height={512}
            unoptimized
            crossOrigin="anonymous"
            src={`${process.env.CDN_URL}/${data.Image.AvatarIconPath}`}
            priority={true}
            className="rounded-md w-full h-full object-contain"
            alt="ALT"
          />
          <Image
            width={32}
            height={32}
            unoptimized
            crossOrigin="anonymous"
            src={`${process.env.CDN_URL}/${damageType?.[data.DamageType].Icon}`}
            className="absolute top-0 left-0 w-6 h-6 rounded-full"
            alt={data.DamageType.toLowerCase()}
          />
          <Image
            width={32}
            height={32}
            unoptimized
            crossOrigin="anonymous"
            src={`${process.env.CDN_URL}/${baseType?.[data.BaseType].Icon}`}
            className="absolute top-0 right-0 w-6 h-6 rounded-full"
            alt={data.BaseType.toLowerCase()}
            style={{
              boxShadow: "inset 0 0 8px 4px #9CA3AF"
            }}
          />
        </div>
      </div>

      <ParseText
        locale={locale}
        text={getNameChar(locale, transI18n, data)}
        className="
          w-full px-0.5
          my-1
          text-center font-bold text-shadow-white
          leading-tight
          wrap-break-word
          text-sm sm:text-base 2xl:text-lg
        "
      />
    </li>

  );
}
