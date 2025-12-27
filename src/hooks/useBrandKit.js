'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'dexpdf_brand_kit'

const DEFAULT_BRAND = {
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    logo: null, // Data URL
    signature: null // Data URL
}

export function useBrandKit() {
    const [brand, setBrand] = useState(DEFAULT_BRAND)
    const [hasBrand, setHasBrand] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setBrand({ ...DEFAULT_BRAND, ...parsed })
                setHasBrand(true)
            } catch (e) {
                console.error("Failed to load brand kit", e)
            }
        }
    }, [])

    const updateBrand = (newBrand) => {
        const updated = { ...brand, ...newBrand }
        setBrand(updated)
        setHasBrand(true)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    const clearBrand = () => {
        setBrand(DEFAULT_BRAND)
        setHasBrand(false)
        localStorage.removeItem(STORAGE_KEY)
    }

    return {
        brand,
        updateBrand,
        clearBrand,
        hasBrand
    }
}
