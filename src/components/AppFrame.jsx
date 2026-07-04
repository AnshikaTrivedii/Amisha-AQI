export default function AppFrame({ children }) {
  return (
    <div className="app-frame">
      <img
        src="/uppcb-frame.jpg"
        alt="Uttar Pradesh Pollution Control Board AQI"
        className="app-frame__image"
      />
      <div className="app-frame__slot">
        <div className="app-shell">{children}</div>
      </div>
    </div>
  )
}
