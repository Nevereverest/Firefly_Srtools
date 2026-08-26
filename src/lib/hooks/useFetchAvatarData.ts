"use client"
import { useQuery } from '@tanstack/react-query'
import { getAvatarListApi } from '@/lib/api'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useDetailDataStore from '@/stores/detailDataStore'
import useCurrentDataStore from '@/stores/currentDataStore'
import useUserDataStore from '@/stores/userDataStore'
import { converterToAvatarStore } from '@/helper'
import { useShallow } from 'zustand/react/shallow'

export const useFetchAvatarData = () => {
  const { setMapAvatar, mapAvatar } = useDetailDataStore(
    useShallow((state) => ({
      setMapAvatar: state.setMapAvatar,
      mapAvatar: state.mapAvatar,
    }))
  )
  const { setAvatars, avatars } = useUserDataStore(
    useShallow((state) => ({
      setAvatars: state.setAvatars,
      avatars: state.avatars,
    }))
  )
  const { avatarSelected, setAvatarSelected } = useCurrentDataStore(
    useShallow((state) => ({
      avatarSelected: state.avatarSelected,
      setAvatarSelected: state.setAvatarSelected,
    }))
  )

  const query = useQuery({
    queryKey: ['AvatarData'],
    queryFn: getAvatarListApi,
    staleTime: 1000 * 60 * 5,
  })
  useEffect(() => {
    if (!mapAvatar || Object.keys(mapAvatar).length === 0) return
    const listAvatarId = Object.keys(avatars)
    const listAvatarNotExist = Object.entries(mapAvatar).filter(([avatarId]) => !listAvatarId.includes(avatarId))
    if (listAvatarNotExist.length === 0) return
    const avatarStore = converterToAvatarStore(Object.fromEntries(listAvatarNotExist))
    if (Object.keys(avatarStore).length === 0) return
    setAvatars({ ...avatars, ...avatarStore })
  }, [mapAvatar, avatars, setAvatars])

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