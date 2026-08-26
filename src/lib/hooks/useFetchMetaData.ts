"use client"
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { getMetadataApi } from '@/lib/api'
import useCurrentDataStore from '@/stores/currentDataStore'
import useDetailDataStore from '@/stores/detailDataStore'
import { useShallow } from 'zustand/react/shallow'

export const useFetchConfigData = () => {
    const { setMetaData } = useDetailDataStore(
        useShallow((state) => ({ setMetaData: state.setMetaData }))
    )
    const { setSettingData } = useCurrentDataStore(
        useShallow((state) => ({ setSettingData: state.setSettingData }))
    )

    const query = useQuery({
        queryKey: ['initialConfigData'],
        queryFn: async () => {
            const metaData = await getMetadataApi()
            return { metaData }
        },
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (query.data && !query.error) {
            setSettingData(query.data.metaData)
            setMetaData(query.data.metaData)
        }
        else if (query.error) {
            toast.error("Failed to load initial config data")
        }
    }, [query.data, query.error, setMetaData, setSettingData])

    return query
}
