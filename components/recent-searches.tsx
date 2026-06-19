"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Clock, Trash2 } from "lucide-react"

interface RecentSearchesProps {
  searches: string[]
  onSelectSearch: (city: string) => void
  onClearSearches: () => void
}

export default function RecentSearches({ searches, onSelectSearch, onClearSearches }: RecentSearchesProps) {
  if (searches.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Recent Searches
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSearches}
          className="h-6 px-2 text-xs text-white/70 hover:text-white"
          aria-label="Clear all recent searches"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((city, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 border-none text-white h-7 px-2 text-xs"
            onClick={() => onSelectSearch(city)}
          >
            <MapPin className="h-3 w-3 mr-1" />
            {city}
          </Button>
        ))}
      </div>
    </div>
  )
}
