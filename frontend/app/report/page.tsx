"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contractService } from "@/services/contract"

export default function ReportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      const scamType = formData.get("scam-type")?.toString() || "other"
      const url = formData.get("url")?.toString() || ""

      const scamTypeValue = mapScamTypeToNumber(scamType)
      await contractService.submitReport(url, scamTypeValue)

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting report:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const mapScamTypeToNumber = (type: string): number => {
    switch (type) {
      case "phishing":
        return 0
      case "investment":
        return 1
      case "romance":
        return 2
      case "shopping":
        return 3
      case "tech-support":
        return 4
      default:
        return 5
    }
  }

  if (isSubmitted) {
    return (
      <div className="container py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Report Submitted</CardTitle>
            <CardDescription>Thank you for helping make the internet safer</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your report has been submitted successfully.</p>
            <Button onClick={() => setIsSubmitted(false)}>Submit Another Report</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Report a Scam</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Scam Report Form</CardTitle>
          <CardDescription>Help others by reporting scams you've encountered</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="scam-type">Scam Type</Label>
              <Select required>
                <SelectTrigger id="scam-type">
                  <SelectValue placeholder="Select scam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phishing">Phishing</SelectItem>
                  <SelectItem value="investment">Investment Scam</SelectItem>
                  <SelectItem value="romance">Romance Scam</SelectItem>
                  <SelectItem value="shopping">Shopping Scam</SelectItem>
                  <SelectItem value="tech-support">Tech Support Scam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL or Contact Information</Label>
              <Input id="url" placeholder="https://example.com or phone number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the scam in detail" required />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : <><Send className="mr-2 h-4 w-4" />Submit Report</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
