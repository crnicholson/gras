/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect } from "react"
import Image from "next/image"

type Powerup = {
  name: string
  type: 'tap' | 'cps'
  value: number
  baseCost: number
  level: number
}

const initialPowerups: Powerup[] = [
  { name: "fertilizer", type: "tap", value: 1, baseCost: 10, level: 0 },
  { name: "sunlight", type: "tap", value: 3, baseCost: 30, level: 0 },
  { name: "sprinkler", type: "cps", value: 1, baseCost: 50, level: 0 },
  { name: "lawnmower army", type: "cps", value: 3, baseCost: 100, level: 0 },
  { name: "worm boost", type: "tap", value: 5, baseCost: 150, level: 0 },
]

export default function Home() {
  const [taps, setTaps] = useState(0)
  const [tapPower, setTapPower] = useState(1)
  const [cps, setCPS] = useState(0)
  const [powerups, setPowerups] = useState<Powerup[]>(initialPowerups)
  const [level, setLevel] = useState("hoe")
  const [levelNumber, setLevelNumber] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setTaps(current => current + cps)
    }, 1000)
    return () => clearInterval(interval)
  }, [cps])

  const calculateCost = (baseCost: number, level: number) =>
    Math.floor(baseCost * Math.pow(1.5, level))

  const buyPowerup = (index: number) => {
    const pwr = powerups[index]
    const cost = calculateCost(pwr.baseCost, pwr.level)
    if (taps < cost) return

    setTaps(prev => prev - cost)

    const updated = [...powerups]
    updated[index].level += 1

    if (pwr.type === "tap") setTapPower(tp => tp + pwr.value)
    else setCPS(c => c + pwr.value)

    setPowerups(updated)
  }

  return (
    <div className="bg-gradient-to-b from-lime-950 to-green-900 min-h-screen flex flex-col items-center justify-center p-4 text-white font-mono">
      <div className="mt-10 bg-black/20 backdrop-blur-md rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 w-full border max-w-lg border-green-800">

        <div className="-mt-18 bg-green-900 rounded-3xl p-4 shadow-2xl border border-lime-300">level {levelNumber}: {level}</div>

        <h1 className="text-4xl font-extrabold tracking-tight text-lime-300 drop-shadow-md animate-pulse">
          🌿 touch the gras 🌿
        </h1>

        <button
          onClick={() => setTaps(taps + tapPower)}
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
          <p className="text-sm italic">tap power: +{tapPower} | cps: +{cps}</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          {powerups.map((pwr, i) => {
            const cost = calculateCost(pwr.baseCost, pwr.level)
            return (
              <button
                key={i}
                disabled={taps < cost}
                onClick={() => buyPowerup(i)}
                className={`w-full font-bold p-4 rounded-lg shadow-inner transition ${taps >= cost
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {pwr.type === "tap" ? "🌟" : "🤖"} {pwr.name} (lv {pwr.level}) +{pwr.value} {pwr.type} — cost: {cost} gras
              </button>
            )
          })}
        </div>

        <p className="text-sm mt-4 opacity-70">keep touchin’. the grass needs you.</p>
      </div>

      <p className="text-gray-300 w-2/3 mt-16 mb-4 text-center">made with ❤️ by charlie. copyright © 2025. open source on <a className="underline" href="https://github.com/crnicholson/gras">github</a>.</p>
    </div>
  )
}
