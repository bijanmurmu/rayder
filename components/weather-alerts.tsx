"use client"

import { useState } from "react"
import { AlertTriangle, ChevronRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { WeatherAlert } from "@/types/weather"

interface WeatherAlertsProps {
  alerts: WeatherAlert[]
  cityName: string
}

export default function WeatherAlerts({ alerts, cityName }: WeatherAlertsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!alerts || alerts.length === 0) {
    return null
  }

  const formatAlertTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Alert className="bg-orange-500/80 border-none text-white mb-4 backdrop-blur-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Weather Alert</AlertTitle>
        <AlertDescription className="flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              {alerts[0].event} - {alerts[0].description.substring(0, 100)}
              {alerts[0].description.length > 100 && "..."}
            </div>
            {alerts.length > 1 && (
              <Badge variant="outline" className="ml-2 border-white text-white">
                +{alerts.length - 1} more
              </Badge>
            )}
          </div>
          {alerts.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="self-end mt-2 text-white hover:bg-white/20 px-2 py-1 h-auto text-xs"
              onClick={() => setIsDialogOpen(true)}
            >
              View All Alerts <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </AlertDescription>
      </Alert>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900/95 border-none text-white sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Weather Alerts for {cityName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {alerts.map((alert, index) => (
              <div key={index} className="bg-orange-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-orange-400" />
                    {alert.event}
                  </h3>
                  <Badge className="bg-orange-500">{alert.sender_name}</Badge>
                </div>
                <div className="text-sm mb-3">
                  <div>
                    <span className="font-medium">From:</span> {formatAlertTime(alert.start)}
                  </div>
                  <div>
                    <span className="font-medium">Until:</span> {formatAlertTime(alert.end)}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-line">{alert.description}</p>
                {alert.tags && alert.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {alert.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
