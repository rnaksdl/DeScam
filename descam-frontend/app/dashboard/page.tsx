"use client"

import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle, BarChart3, PieChart, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for dashboard
  const stats = {
    scansToday: 24,
    scansTotal: 1243,
    threatsDetected: 17,
    threatsPrevented: 15,
  }

  const recentScans = [
    { id: 1, url: "https://secure-bank-login.com", result: "threat", date: "2 hours ago" },
    { id: 2, url: "https://amazon.com", result: "safe", date: "3 hours ago" },
    { id: 3, url: "https://win-free-iphone.net", result: "threat", date: "5 hours ago" },
    { id: 4, url: "https://netflix.com", result: "safe", date: "Yesterday" },
    { id: 5, url: "https://claim-your-prize.xyz", result: "threat", date: "Yesterday" },
  ]

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Scan New URL</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scans Today</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scansToday}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scansTotal}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.threatsDetected}</div>
            <p className="text-xs text-muted-foreground">+3 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Prevented</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.threatsPrevented}</div>
            <div className="mt-2">
              <Progress value={88} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">88% prevention rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-8" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Scans</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Scan Activity</CardTitle>
                <CardDescription>Your scan activity over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Activity chart will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Threat Types</CardTitle>
                <CardDescription>Distribution of detected threats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <PieChart className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Threat distribution chart will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your most recent scan results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {scan.result === "threat" ? (
                        <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{scan.url}</p>
                        <p className="text-sm text-muted-foreground">{scan.date}</p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          scan.result === "threat"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                      >
                        {scan.result === "threat" ? "Threat Detected" : "Safe"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Reports</CardTitle>
              <CardDescription>Scams you've reported to our community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Reports Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven't reported any scams yet. Help the community by reporting scams you encounter.
                  </p>
                  <Button className="mt-4">Report a Scam</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
