"use client"
import { useQuery } from '@tanstack/react-query'
import { getMOCEventListApi } from '@/lib/api'
import { useEffect } from 'react'
import useDetailDataStore from '@/stores/detailDataStore'
import { toast } from 'react-toastify'
import { useShallow } from 'zustand/react/shallow'

export const useFetchMOCGroupData = () => {
    const { setMapMoc } = useDetailDataStore(
        useShallow((state) => ({ setMapMoc: state.setMapMoc }))
    )
    const query = useQuery({
        queryKey: ['MOCGroupData'],
        queryFn: getMOCEventListApi,
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (query.data && !query.error) {
            setMapMoc(query.data)
        } else if (query.error) {
            toast.error("Failed to load MOCGroup data")
        }
    }, [query.data, query.error, setMapMoc])

    return query
}
