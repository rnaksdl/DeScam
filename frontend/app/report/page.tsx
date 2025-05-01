"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ReportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
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
            <Alert className="bg-green-50 dark:bg-green-950/30">
              <AlertTriangle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-400">Report Received</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your scam report has been submitted successfully. Our team will review it shortly.
              </AlertDescription>
            </Alert>
            <div className="mt-6">
              <Button onClick={() => setIsSubmitted(false)}>Submit Another Report</Button>
            </div>
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
              <Label>How did you encounter this scam?</Label>
              <RadioGroup defaultValue="email">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="website" id="website" />
                  <Label htmlFor="website">Website</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms">SMS/Text Message</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="social" id="social" />
                  <Label htmlFor="social">Social Media</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone">Phone Call</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL or Contact Information (if applicable)</Label>
              <Input id="url" placeholder="https://example.com or phone number" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe the scam in detail. What happened? What did they ask for?"
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Your Email (optional)</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
              <p className="text-sm text-muted-foreground">We'll only contact you if we need more information</p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Your report helps us build a safer internet for everyone. Thank you for contributing.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
