"use client"
import { motion } from "framer-motion"

export default function AbstractGeometry({ weatherId }) {
  // Clear: Huge expanding/contracting white circle
  if (weatherId === 800) {
    return (
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white mx-auto"
      />
    )
  }

  // Clouds: Intersecting massive rectangles
  if (weatherId >= 801 && weatherId <= 804) {
    return (
      <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto flex items-center justify-center">
        <motion.div 
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-full h-1/3 bg-white"
        />
        <motion.div 
          animate={{ x: [10, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-4/5 h-1/2 bg-white/50 mix-blend-difference top-1/4"
        />
      </div>
    )
  }

  // Rain: Diagonal thick bars
  if (weatherId >= 300 && weatherId <= 531) {
    return (
      <div className="w-48 h-48 md:w-64 md:h-64 mx-auto flex gap-4 overflow-hidden transform -skew-x-12">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [-200, 200] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
            className="w-8 h-full bg-white"
          />
        ))}
      </div>
    )
  }

  // Thunder: Violent jagged polygons
  if (weatherId >= 200 && weatherId <= 232) {
    return (
      <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
        <motion.div
          animate={{ opacity: [1, 0, 1, 0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "steps(2)" }}
          className="w-0 h-0 border-l-[100px] border-r-[100px] border-b-[200px] border-l-transparent border-r-transparent border-b-white absolute top-0 left-0"
        />
        <motion.div
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, ease: "steps(2)", delay: 0.2 }}
          className="w-0 h-0 border-l-[80px] border-r-[80px] border-t-[150px] border-l-transparent border-r-transparent border-t-white absolute bottom-0 right-0 mix-blend-difference"
        />
      </div>
    )
  }

  // Snow: Grid of tiny squares
  if (weatherId >= 600 && weatherId <= 622) {
    return (
      <div className="w-48 h-48 md:w-64 md:h-64 mx-auto grid grid-cols-4 gap-4 p-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
            className="w-full aspect-square bg-white"
          />
        ))}
      </div>
    )
  }

  // Default
  return <div className="w-48 h-48 md:w-64 md:h-64 rounded-none bg-white mx-auto" />
}
