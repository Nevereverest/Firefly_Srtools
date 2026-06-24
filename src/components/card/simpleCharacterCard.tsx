"use client";
import Image from 'next/image';
import { AvatarDetail } from '@/types';
import useDetailDataStore from '@/stores/detailDataStore';


interface SimpleAvatarCardProps {
  data: AvatarDetail;
  isSelected?: boolean;
  onClick?: () => void;
  showRemoveHover?: boolean;
}

export const SimpleAvatarCard = ({ data, isSelected, onClick, showRemoveHover }: SimpleAvatarCardProps) => {
const { baseType, damageType } = useDetailDataStore()

  return (
    <div 
      onClick={onClick}
      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-md cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 shadow-md shrink-0
        ${isSelected ? 'ring-2 ring-success opacity-60' : ''}
        bg-linear-to-br ${data.Rarity === "CombatPowerAvatarRarityType5"
          ? "from-yellow-400 via-yellow-600/70 to-yellow-800/50"
          : "from-purple-400 via-purple-600/70 to-purple-800/50"
        }`}
    >
      <Image
        width={80}
        height={80}
        unoptimized
        crossOrigin="anonymous"
        src={`${process.env.CDN_URL}/${data.Image.ActionAvatarHeadIconPath}`}
        priority={true}
        className="w-full h-full object-contain"
        alt="Avatar"
      />
      <div className="absolute top-0 left-0 w-5 h-5 bg-black/40 rounded-full flex items-center justify-center p-0.5">
        <Image
          width={20}
          height={20}
          unoptimized
          crossOrigin="anonymous"
          src={`${process.env.CDN_URL}/${damageType?.[data.DamageType]?.Icon}`}
          className="w-full h-full object-contain"
          alt="Element"
        />
      </div>
      <div className="absolute top-0 right-0 w-5 h-5 bg-black/40 rounded-full flex items-center justify-center p-0.5">
        <Image
          width={20}
          height={20}
          unoptimized
          crossOrigin="anonymous"
          src={`${process.env.CDN_URL}/${baseType?.[data.BaseType]?.Icon}`}
          className="w-full h-full object-contain"
          alt="Path"
        />
      </div>

      {showRemoveHover && (
        <div className="absolute inset-0 bg-error/80 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
    </div>
  );
};