/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useQuery } from '@tanstack/react-query'
import { getAvatarListApi } from '@/lib/api'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useDetailDataStore from '@/stores/detailDataStore'
import useCurrentDataStore from '@/stores/currentDataStore'
import useUserDataStore from '@/stores/userDataStore'
import { converterToAvatarStore } from '@/helper'

export const useFetchAvatarData = () => {
  const { setMapAvatar, mapAvatar } = useDetailDataStore()
  const { setAvatar, avatars } = useUserDataStore()
  const { avatarSelected, setAvatarSelected } = useCurrentDataStore()

  const query = useQuery({
    queryKey: ['AvatarData'],
    queryFn: getAvatarListApi,
    staleTime: 1000 * 60 * 5,
  })
    useEffect(() => {
        const listAvatarId = Object.keys(avatars)
        const listAvatarNotExist = Object.entries(mapAvatar).filter(([avatarId]) => !listAvatarId.includes(avatarId))
        const avatarStore = converterToAvatarStore(Object.fromEntries(listAvatarNotExist))
        if (Object.keys(avatarStore).length === 0) return
        for (const avatar of Object.values(avatarStore)) {
            setAvatar(avatar)
        }
    }, [mapAvatar])

  useEffect(() => {
    if (query.data) {
        setMapAvatar(query.data)
        if (!avatarSelected) {
            setAvatarSelected(Object.values(query.data)[0])
        }
    }
    if (query.error) toast.error("Failed to load Avatar data")
  }, [query.data, query.error, setMapAvatar, avatarSelected, setAvatarSelected])

  return query
}