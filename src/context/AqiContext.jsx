import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { DEFAULT_CITY, fetchAqiData, getAllCities } from '../utils/xmlApi'
import { getAqiHistory, recordAqiReading, toReadingIsoDate } from '../utils/aqiHistory'

const REFRESH_INTERVAL_MS = 20 * 60 * 1000

const AqiContext = createContext(null)

export function AqiProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY)
  const [cityList, setCityList] = useState([])

  const loadData = useCallback(async (cityName, isInitial = false, forceRefresh = false) => {
    if (isInitial) setLoading(true)

    try {
      const result = await fetchAqiData(cityName, forceRefresh)
      const readingDate = toReadingIsoDate(result.cityData.lastUpdatedRaw)
      recordAqiReading(result.cityData.name, result.cityData.aqi, readingDate)
      result.cityData.history = getAqiHistory(result.cityData.name)
      setData(result)
      setError(null)
    } catch (err) {
      if (isInitial) setError(err.message)
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [])

  const selectCity = useCallback((cityName) => {
    setSelectedCity(cityName)
  }, [])

  useEffect(() => {
    getAllCities()
      .then(setCityList)
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadData(selectedCity, true)
    const intervalId = setInterval(
      () => loadData(selectedCity, false, true),
      REFRESH_INTERVAL_MS,
    )
    return () => clearInterval(intervalId)
  }, [selectedCity, loadData])

  return (
    <AqiContext.Provider
      value={{
        ...data,
        loading,
        error,
        selectedCity,
        cityList,
        selectCity,
      }}
    >
      {children}
    </AqiContext.Provider>
  )
}

export function useAqi() {
  const context = useContext(AqiContext)
  if (!context) {
    throw new Error('useAqi must be used within AqiProvider')
  }
  return context
}
