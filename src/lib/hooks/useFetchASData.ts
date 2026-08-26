"use client"
import { useQuery } from '@tanstack/react-query'
import { getASEventListApi } from '@/lib/api'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useDetailDataStore from '@/stores/detailDataStore'
import { useShallow } from 'zustand/react/shallow'

export const useFetchASGroupData = () => {
    const { setMapAS } = useDetailDataStore(
        useShallow((state) => ({ setMapAS: state.setMapAS }))
    )
    
    const query = useQuery({
        queryKey: ['ASGroupData'],
        queryFn: getASEventListApi,
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (query.data) {
            setMapAS(query.data)
        } else if (query.error) {
            toast.error("Failed to load ASGroup data")
        }
    }, [query.data, query.error, setMapAS])
    
    return query
}
