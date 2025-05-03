"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ScanPage() {
  const [inputValue, setInputValue] = useState("")
  const [scanResult, setScanResult] = useState<null | { safe: boolean; message: string }>(null)
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = () => {
    if (!inputValue) return

    setIsScanning(true)
    setScanResult(null)

    // Simulate API call with timeout
    setTimeout(() => {
      // This is just a mock result - in a real app, you'd call your API
      const isSafe = !inputValue.includes("scam") && Math.random() > 0.3

      setScanResult({
        safe: isSafe,
        message: isSafe
          ? "No suspicious activity detected. This appears to be safe."
          : "Warning! This might be a scam. We detected suspicious patterns.",
      })
      setIsScanning(false)
    }, 2000)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Scam Scanner</h1>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="message">Message</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-0">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Scan a URL</CardTitle>
              <CardDescription>Enter a website URL to check if it's a potential scam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button type="submit" onClick={handleScan} disabled={isScanning || !inputValue}>
                  {isScanning ? "Scanning..." : "Scan"}
                </Button>
              </div>

              {scanResult && (
                <Alert
                  className={`mt-4 ${scanResult.safe ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}
                >
                  {scanResult.safe ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <AlertTitle
                    className={
                      scanResult.safe ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-400"
                    }
                  >
                    {scanResult.safe ? "Safe" : "Potential Scam Detected"}
                  </AlertTitle>
                  <AlertDescription
                    className={
                      scanResult.safe ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                    }
                  >
                    {scanResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Our scanner checks against a database of known scams and analyzes for suspicious patterns.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="message" className="mt-0">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Scan a Message</CardTitle>
              <CardDescription>Paste a suspicious message to check if it matches known scam patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col w-full space-y-4">
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Paste the suspicious message here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button type="submit" onClick={handleScan} disabled={isScanning || !inputValue}>
                  {isScanning ? "Scanning..." : "Scan Message"}
                </Button>
              </div>

              {scanResult && (
                <Alert
                  className={`mt-4 ${scanResult.safe ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}
                >
                  {scanResult.safe ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <AlertTitle
                    className={
                      scanResult.safe ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-400"
                    }
                  >
                    {scanResult.safe ? "Safe" : "Potential Scam Detected"}
                  </AlertTitle>
                  <AlertDescription
                    className={
                      scanResult.safe ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                    }
                  >
                    {scanResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-0">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Scan an Email</CardTitle>
              <CardDescription>
                Forward a suspicious email to scan@descam.com or paste the content below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col w-full space-y-4">
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Paste the email content here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button type="submit" onClick={handleScan} disabled={isScanning || !inputValue}>
                  {isScanning ? "Scanning..." : "Scan Email"}
                </Button>
              </div>

              {scanResult && (
                <Alert
                  className={`mt-4 ${scanResult.safe ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}
                >
                  {scanResult.safe ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <AlertTitle
                    className={
                      scanResult.safe ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-400"
                    }
                  >
                    {scanResult.safe ? "Safe" : "Potential Scam Detected"}
                  </AlertTitle>
                  <AlertDescription
                    className={
                      scanResult.safe ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                    }
                  >
                    {scanResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
