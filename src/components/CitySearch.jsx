import { useEffect, useMemo, useRef, useState } from 'react'
import { useAqi } from '../context/AqiContext'

export default function CitySearch({ open, onClose }) {
  const { cityList, selectedCity, selectCity } = useAqi()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const filteredCities = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return cityList.slice(0, 50)

    return cityList.filter((city) => city.toLowerCase().includes(trimmed)).slice(0, 50)
  }, [cityList, query])

  const handleSelect = (city) => {
    selectCity(city)
    onClose()
  }

  if (!open) return null

  return (
    <div className="city-search">
      <button type="button" className="city-search__backdrop" onClick={onClose} aria-label="Close search" />
      <div className="city-search__panel">
        <div className="city-search__input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="city-search__input"
            placeholder="Search city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="city-search__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <ul className="city-search__results">
          {filteredCities.length === 0 ? (
            <li className="city-search__empty">No cities found</li>
          ) : (
            filteredCities.map((city) => (
              <li key={city}>
                <button
                  type="button"
                  className={`city-search__option${city === selectedCity ? ' city-search__option--active' : ''}`}
                  onClick={() => handleSelect(city)}
                >
                  {city}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
