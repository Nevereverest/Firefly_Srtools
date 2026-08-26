"use client";
import Image from 'next/image';
import { AvatarDetail } from '@/types';
import useDetailDataStore from '@/stores/detailDataStore';
import { useShallow } from 'zustand/react/shallow';
import { X } from 'lucide-react';

interface SimpleAvatarCardProps {
  data: AvatarDetail;
  isSelected?: boolean;
  onClick?: () => void;
  showRemoveHover?: boolean;
}

export const SimpleAvatarCard = ({ data, isSelected, onClick, showRemoveHover }: SimpleAvatarCardProps) => {
  const { baseType, damageType } = useDetailDataStore(
    useShallow((state) => ({
      baseType: state.baseType,
      damageType: state.damageType,
    }))
  )

  const is5Star = data.Rarity === "CombatPowerAvatarRarityType5";

  return (
    <div 
      onClick={onClick}
      className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl cursor-pointer shadow-sm hover:shadow-md shrink-0 border border-base-content/10 overflow-hidden select-none ${
        isSelected ? 'ring-2 ring-primary opacity-60 scale-95' : ''
      }`}
    >
      <div
        className={`relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-linear-to-b ${
          is5Star
            ? "from-yellow-400 via-amber-500/85 to-amber-700/70"
            : "from-purple-400 via-purple-600/80 to-purple-800/60"
        }`}
      >
        <Image
          width={80}
          height={80}
          unoptimized
          crossOrigin="anonymous"
          src={`${process.env.CDN_URL}/${data.Image.ActionAvatarHeadIconPath}`}
          priority={true}
          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
          alt="Avatar"
        />
        {damageType?.[data.DamageType]?.Icon && (
          <div className="absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-black/60 backdrop-blur-xs rounded-full flex items-center justify-center p-0.5 border border-white/10">
            <Image
              width={20}
              height={20}
              unoptimized
              crossOrigin="anonymous"
              src={`${process.env.CDN_URL}/${damageType[data.DamageType].Icon}`}
              className="w-full h-full object-contain"
              alt="Element"
            />
          </div>
        )}
        {baseType?.[data.BaseType]?.Icon && (
          <div className="absolute top-0.5 right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-black/60 backdrop-blur-xs rounded-full flex items-center justify-center p-0.5 border border-white/10">
            <Image
              width={20}
              height={20}
              unoptimized
              crossOrigin="anonymous"
              src={`${process.env.CDN_URL}/${baseType[data.BaseType].Icon}`}
              className="w-full h-full object-contain"
              alt="Path"
            />
          </div>
        )}

        {showRemoveHover && (
          <div className="absolute inset-0 bg-error/90 backdrop-blur-xs rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <X className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};