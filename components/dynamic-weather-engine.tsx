"use client"
import { useEffect, useRef } from "react"

export default function DynamicWeatherEngine({ weatherId, windSpeed, isDay, themeBg, themeFg }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener("resize", resize)
    resize()

    const particles = []

    // Helper functions
    const random = (min, max) => Math.random() * (max - min) + min

    // Determine conditions
    const isRain = weatherId >= 300 && weatherId <= 531
    const isSnow = weatherId >= 600 && weatherId <= 622
    const isThunder = weatherId >= 200 && weatherId <= 232
    const isClear = weatherId === 800
    const isClouds = weatherId >= 801 && weatherId <= 804

    // Colors - No longer rendering background in canvas, handled by CSS theme in page.tsx
    // We only use themeFg for particle color
    
    // Initialize particles based on weather
    const initParticles = () => {
      particles.length = 0
      const count = isRain ? 200 : isSnow ? 150 : isClouds ? 20 : isClear ? 50 : 100

      for (let i = 0; i < count; i++) {
        particles.push({
          x: random(0, width),
          y: random(0, height),
          size: isRain ? random(1, 3) : isSnow ? random(2, 5) : isClouds ? random(100, 300) : random(1, 3),
          speedY: isRain ? random(15, 25) : isSnow ? random(1, 3) : isClouds ? 0 : random(0.2, 1),
          speedX: isClouds ? random(0.1, 0.5) : (windSpeed * random(0.5, 1.5)) / 2,
          opacity: isClouds ? random(0.05, 0.15) : isClear ? random(0.2, 0.8) : random(0.4, 0.8),
          angle: random(0, Math.PI * 2)
        })
      }
    }
    initParticles()

    const render = () => {
      // Clear canvas (background color is handled by CSS in page.tsx)
      ctx.clearRect(0, 0, width, height)

      // Use white for particles (opacity handles the blending)
      ctx.fillStyle = "#ffffff"
      ctx.strokeStyle = "#ffffff"

      particles.forEach((p) => {
        // Update positions
        if (isRain) {
          p.x += p.speedX
          p.y += p.speedY
          if (p.y > height) {
            p.y = -20
            p.x = random(-200, width)
          }
        } else if (isSnow) {
          p.angle += 0.02
          p.x += Math.sin(p.angle) * 2 + p.speedX * 0.2
          p.y += p.speedY
          if (p.y > height) {
            p.y = -20
            p.x = random(-200, width)
          }
        } else if (isClouds) {
          p.x += p.speedX
          if (p.x - p.size > width) {
            p.x = -p.size
          }
        } else if (isClear) {
          p.y -= p.speedY
          if (p.y < -20) {
            p.y = height + 20
            p.x = random(0, width)
          }
        }

        // Draw particles
        if (isRain) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.speedX * 0.5, p.y + p.speedY * 0.5)
          ctx.lineWidth = p.size
          ctx.globalAlpha = p.opacity
          ctx.stroke()
        } else if (isSnow || isClear) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.globalAlpha = p.opacity
          ctx.fill()
        } else if (isClouds) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.globalAlpha = p.opacity
          ctx.fill()
        }
      })
      
      ctx.globalAlpha = 1
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [weatherId, windSpeed, isDay])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
    />
  )
}
