/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useUser } from "@auth0/nextjs-auth0"

type Powerup = {
  name: string
  type: 'tap' | 'cps'
  value: number
  baseCost: number
  level: number
}

type Level = {
  name: string
  minTaps: number
  level: number
  image: string
}

const levels: Level[] = [
  { name: "amateur", minTaps: 0, level: 1, image: "/toucher.png" },
  { name: "rake", minTaps: 20, level: 2, image: "/rake.png" },
  { name: "hoe", minTaps: 100, level: 3, image: "/hoe.png" },
  { name: "shovel", minTaps: 500, level: 4, image: "/shovel.png" },
  { name: "weedwacker", minTaps: 1000, level: 5, image: "/weedwacker.png" },
  { name: "roomba mower", minTaps: 5000, level: 6, image: "/roomba.png" },
  { name: "god", minTaps: 10000, level: 7, image: "/windowsGrass.png" },
]

const SERVER = process.env.NEXT_PUBLIC_SERVER
const STORAGE_KEY = process.env.NEXT_PUBLIC_LOCAL_STORAGE

export default function Home() {
  const [taps, setTaps] = useState(0)
  const [tapPower, setTapPower] = useState(1)
  const [cps, setCPS] = useState(0)
  const [powerups, setPowerups] = useState<Powerup[]>([
    { name: "fertilizer", type: "tap", value: 1, baseCost: 10, level: 0 },
    { name: "sunlight", type: "tap", value: 3, baseCost: 30, level: 0 },
    { name: "sprinkler", type: "cps", value: 1, baseCost: 50, level: 0 },
    { name: "lawnmower army", type: "cps", value: 3, baseCost: 100, level: 0 },
    { name: "worm boost", type: "tap", value: 5, baseCost: 150, level: 0 },
  ])
  const [totalTaps, setTotalTaps] = useState(0)

  const [levelName, setLevelName] = useState("amateur")
  const [levelNumber, setLevelNumber] = useState(1)
  const [levelImage, setLevelImage] = useState("/toucher.png")

  const { user, isLoading } = useUser()

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

  const findLevel = useCallback(() => {
    for (const lvl of levels) {
      if (totalTaps >= lvl.minTaps) {
        setLevelName(lvl.name)
        setLevelNumber(lvl.level)
        setLevelImage(lvl.image)
      }
    }
  }, [totalTaps])

  const saveProgress = useCallback(() => {
    const data = {
      taps,
      tapPower,
      cps,
      powerups,
      totalTaps,
    }
    if (STORAGE_KEY) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } else {
      console.error("STORAGE_KEY is not defined")
    }
  }, [taps, tapPower, cps, powerups, totalTaps])

  const saveToServer = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER}/save-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.sub, name: user?.name, taps, tapPower, cps, powerups, totalTaps }),
      })
      if (!response.ok) {
        const error = await response.json()
        console.error("", error)
      }
    } catch (error) {
      console.error("client-side error:", error)
    }
  }, [user?.sub, user?.name, taps, tapPower, cps, powerups, totalTaps])

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const response = await fetch(`${SERVER}/load-progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user?.sub }),
          })
          if (!response.ok) {
            const error = await response.json()
            console.log("", error)
          } else {
            const data = await response.json()

            setTaps(data.taps ?? 0)
            setTapPower(data.tapPower ?? 1)
            setCPS(data.cps ?? 0)
            setPowerups(data.powerups)
            setTotalTaps(data.totalTaps ?? 0)
          }
        } catch (error) {
          console.error("Client-side error:", error)
        }
      } else if (STORAGE_KEY) {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return
        try {
          const data = JSON.parse(saved)
          setTaps(data.taps ?? 0)
          setTapPower(data.tapPower ?? 1)
          setCPS(data.cps ?? 0)
          setPowerups(data.powerups)
          setTotalTaps(data.totalTaps ?? 0)
        } catch (err) {
          console.error("failed to parse save data:", err)
        }
      } else {
        console.error("STORAGE_KEY is not defined")
      }
    }

    loadProgress()
  }, [user])

  useEffect(() => {
    findLevel()
  }, [totalTaps, findLevel])

  useEffect(() => {
    const interval = setInterval(() => {
      setTaps(current => current + cps)
      setTotalTaps(current => current + cps)
      saveProgress()
      if (user) saveToServer()
    }, 1000)
    return () => clearInterval(interval)
  }, [cps, saveProgress, user, saveToServer])

  return (
    <div className="bg-gradient-to-b from-lime-950 to-green-900 min-h-screen flex flex-col items-center justify-center p-4 text-white font-mono">
      <div className="h-10 w-full flex justify-between items-center">
        <p>gras</p>
        <a href="/auth/login">🔑</a>
        <a href="/auth/logout">👋</a>
        <p>❓</p>
      </div>

      <div className="mt-10 bg-black/20 backdrop-blur-md rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 w-full border max-w-lg border-green-800">
        <div className="-mt-18 bg-green-900 rounded-3xl p-4 shadow-2xl border border-lime-300">level {levelNumber}: {levelName}</div>

        <h1 className="text-4xl font-extrabold tracking-tight text-lime-300 drop-shadow-md animate-pulse">
          🌿 touch the gras 🌿
        </h1>

        <button
          onClick={() => {
            setTaps(taps + tapPower)
            setTotalTaps(totalTaps + 1)
            findLevel()
            saveProgress()
            if (user) saveToServer()
          }}
          className="transition hover:scale-105 active:scale-95 focus:outline-none"
        >
          <Image
            src={levelImage}
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
                onClick={() => {
                  buyPowerup(i)
                  saveProgress()
                  if (user) saveToServer()
                }}
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

        <p className="text-sm mt-4 opacity-70">keep touchin{"'"}. the grass needs you.</p>
      </div>

      <p className="text-gray-300 w-2/3 mt-16 mb-4 text-center">made with ❤️ by charlie. © {new Date().getFullYear()}. open source on <a className="underline" href="https://github.com/crnicholson/gras">github</a>.</p>
    </div>
  )
}
