'use client'
import { useState, useEffect } from "react"
import Image from "next/image"

export default function Home() {
  const [taps, setTaps] = useState(0)
  const [powerup, setPowerup] = useState(1)
  const [cps, setCPS] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTaps(current => current + cps)
    }, 1000)
    return () => clearInterval(interval)
  }, [cps])

  const handleClick = () => setTaps(taps + powerup)
  const handleBuyPowerup = () => {
    setTaps(taps - powerup * 10)
    setPowerup(powerup + 1)
  }
  const handleBuyAuto = () => {
    const cost = cps * 20 + 20
    setTaps(taps - cost)
    setCPS(cps + 1)
  }

  return (
    <div className="bg-gradient-to-b from-lime-950 to-green-900 min-h-screen flex flex-col items-center justify-center px-4 text-white font-mono">
      <div className="bg-black/20 backdrop-blur-md rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 w-full max-w-md border border-green-800">
        <h1 className="text-4xl font-extrabold tracking-tight text-lime-300 drop-shadow-md animate-pulse">
          🌿 touch the gras 🌿
        </h1>

        <button
          onClick={handleClick}
          className="transition hover:scale-105 active:scale-95 focus:outline-none"
        >
          <Image
            src="/grass.png"
            alt="Touch the Gras"
            width={200}
            height={200}
            className="rounded-full border-4 border-lime-500 shadow-lg hover:shadow-green-500/50"
          />
        </button>

        <div className="text-center space-y-2">
          <p className="text-xl">🌱 <span className="font-bold text-lime-300">gras:</span> {taps}</p>
          <p className="text-sm italic">Powerup: +{powerup} | CPS: +{cps}</p>
        </div>

        <div className="w-full space-y-3">
          {taps >= powerup * 10 && (
            <button
              onClick={handleBuyPowerup}
              className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded-lg shadow-inner shadow-green-800"
            >
              🌟 Buy Powerup (+1) — Cost: {powerup * 10} gras
            </button>
          )}

          {taps >= cps * 20 + 20 && (
            <button
              onClick={handleBuyAuto}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-inner shadow-teal-800"
            >
              🤖 Buy AutoClicker (+1 CPS) — Cost: {cps * 20 + 20} gras
            </button>
          )}
        </div>

        <p className="text-sm opacity-70 mt-6">Keep touchin’. The grass needs you.</p>
      </div>
    </div>
  )
}
