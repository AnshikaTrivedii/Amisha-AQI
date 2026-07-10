import backgroundImage from '../assets/background.png'

export default function SignageBackground({ className }) {
  return (
    <img
      src={backgroundImage}
      alt=""
      aria-hidden="true"
      className={className}
      decoding="async"
    />
  )
}
