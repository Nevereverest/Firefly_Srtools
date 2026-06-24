"use client"
import { useQuery } from '@tanstack/react-query'
import { getRelicSetListApi } from '@/lib/api'
import { useEffect } from 'react'
import useDetailDataStore from '@/stores/detailDataStore'
import { toast } from 'react-toastify'

export const useFetchRelicSetData = () => {
    const { setMapRelicSet } = useDetailDataStore()
    const query = useQuery({
        queryKey: ['RelicSetData'],
        queryFn: getRelicSetListApi,
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (query.data && !query.error) {
            setMapRelicSet(query.data)
        } else if (query.error) {
            toast.error("Failed to load RelicSet data")
        }
    }, [query.data, query.error, setMapRelicSet])
    
    return query
}
