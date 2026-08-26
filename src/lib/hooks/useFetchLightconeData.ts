"use client"
import { useQuery } from '@tanstack/react-query'
import { getLightconeListApi } from '@/lib/api';
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import useDetailDataStore from '@/stores/detailDataStore';
import { useShallow } from 'zustand/react/shallow';

export const useFetchLightconeData = () => {
    const { setMapLightCone } = useDetailDataStore(
        useShallow((state) => ({ setMapLightCone: state.setMapLightCone }))
    )
    const query = useQuery({
        queryKey: ['lightconeData'],
        queryFn: getLightconeListApi,
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        if (query.data && !query.error) {
            setMapLightCone(query.data)
        } else if (query.error) {
            toast.error("Failed to load lightcone data")
        }
    }, [query.data, query.error, setMapLightCone])

    return query
}
