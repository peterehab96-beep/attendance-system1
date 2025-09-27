"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Settings, Save, RotateCcw, CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react"

interface GradingRule {
  id: string
  name: string
  condition: "on_time" | "late" | "absent"
  score: number
  enabled: boolean
}

interface GradingConfig {
  maxScore: number
  passingScore: number
  lateThreshold: number // minutes after session start
  rules: GradingRule[]
  bonusEnabled: boolean
  bonusScore: number
  penaltyEnabled: boolean
  penaltyScore: number
}

export function GradingConfig() {
  const [config, setConfig] = useState<GradingConfig>({
    maxScore: 10,
    passingScore: 6,
    lateThreshold: 15,
    rules: [
      {
        id: "on_time",
        name: "On-Time Attendance",
        condition: "on_time",
        score: 10,
        enabled: true,
      },
      {
        id: "late",
        name: "Late Attendance",
        condition: "late",
        score: 7,
        enabled: true,
      },
      {
        id: "absent",
        name: "Absent",
        condition: "absent",
        score: 0,
        enabled: true,
      },
    ],
    bonusEnabled: false,
    bonusScore: 2,
    penaltyEnabled: false,
    penaltyScore: 1,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const updateConfig = (updates: Partial<GradingConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
    setSaveSuccess(false)
  }

  const updateRule = (ruleId: string, updates: Partial<GradingRule>) => {
    const updatedRules = config.rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    updateConfig({ rules: updatedRules })
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setHasChanges(false)
    setSaveSuccess(true)
    setIsSaving(false)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleReset = () => {
    setConfig({
      maxScore: 10,
      passingScore: 6,
      lateThreshold: 15,
      rules: [
        {
          id: "on_time",
          name: "On-Time Attendance",
          condition: "on_time",
          score: 10,
          enabled: true,
        },
        {
          id: "late",
          name: "Late Attendance",
          condition: "late",
          score: 7,
          enabled: true,
        },
        {
          id: "absent",
          name: "Absent",
          condition: "absent",
          score: 0,
          enabled: true,
        },
      ],
      bonusEnabled: false,
      bonusScore: 2,
      penaltyEnabled: false,
      penaltyScore: 1,
    })
    setHasChanges(false)
    setSaveSuccess(false)
  }

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case "on_time":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "late":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "absent":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <BarChart3 className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "on_time":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "late":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "absent":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Grading Configuration</h2>
          <p className="text-muted-foreground">Configure attendance scoring rules and grade parameters</p>
        </div>

        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Unsaved Changes
            </Badge>
          )}
          {saveSuccess && (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Basic Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Basic Settings
              </CardTitle>
              <CardDescription>Configure fundamental grading parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-score">Maximum Score</Label>
                  <Input
                    id="max-score"
                    type="number"
                    min="1"
                    max="100"
                    value={config.maxScore}
                    onChange={(e) => updateConfig({ maxScore: Number.parseInt(e.target.value) || 10 })}
                  />
                  <p className="text-xs text-muted-foreground">Maximum points a student can earn per session</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passing-score">Passing Score</Label>
                  <Input
                    id="passing-score"
                    type="number"
                    min="0"
                    max={config.maxScore}
                    value={config.passingScore}
                    onChange={(e) => updateConfig({ passingScore: Number.parseInt(e.target.value) || 6 })}
                  />
                  <p className="text-xs text-muted-foreground">Minimum score required to pass</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Late Threshold: {config.lateThreshold} minutes</Label>
                <Slider
                  value={[config.lateThreshold]}
                  onValueChange={([value]) => updateConfig({ lateThreshold: value })}
                  max={60}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Students arriving after this time will be marked as late
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring Rules</CardTitle>
              <CardDescription>Configure points awarded for different attendance conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.rules.map((rule) => (
                  <div key={rule.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getConditionIcon(rule.condition)}
                        <div>
                          <h4 className="font-medium text-foreground">{rule.name}</h4>
                          <Badge className={getConditionColor(rule.condition)}>
                            {rule.condition.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <Switch checked={rule.enabled} onCheckedChange={(enabled) => updateRule(rule.id, { enabled })} />
                    </div>

                    {rule.enabled && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <Label htmlFor={`score-${rule.id}`} className="text-sm">
                            Score Points
                          </Label>
                          <Input
                            id={`score-${rule.id}`}
                            type="number"
                            min="0"
                            max={config.maxScore}
                            value={rule.score}
                            onChange={(e) => updateRule(rule.id, { score: Number.parseInt(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((rule.score / config.maxScore) * 100)}% of max score
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
              <CardDescription>Additional scoring modifiers and special conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bonus System */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bonus-enabled">Bonus Points</Label>
                    <p className="text-sm text-muted-foreground">Award extra points for exceptional attendance</p>
                  </div>
                  <Switch
                    id="bonus-enabled"
                    checked={config.bonusEnabled}
                    onCheckedChange={(bonusEnabled) => updateConfig({ bonusEnabled })}
                  />
                </div>

                {config.bonusEnabled && (
                  <div className="pl-4 border-l-2 border-green-500/20">
                    <Label htmlFor="bonus-score">Bonus Points</Label>
                    <Input
                      id="bonus-score"
                      type="number"
                      min="0"
                      max="10"
                      value={config.bonusScore}
                      onChange={(e) => updateConfig({ bonusScore: Number.parseInt(e.target.value) || 0 })}
                      className="mt-1 max-w-32"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Extra points for perfect attendance streaks</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Penalty System */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="penalty-enabled">Penalty Points</Label>
                    <p className="text-sm text-muted-foreground">Deduct points for repeated absences</p>
                  </div>
                  <Switch
                    id="penalty-enabled"
                    checked={config.penaltyEnabled}
                    onCheckedChange={(penaltyEnabled) => updateConfig({ penaltyEnabled })}
                  />
                </div>

                {config.penaltyEnabled && (
                  <div className="pl-4 border-l-2 border-red-500/20">
                    <Label htmlFor="penalty-score">Penalty Points</Label>
                    <Input
                      id="penalty-score"
                      type="number"
                      min="0"
                      max="10"
                      value={config.penaltyScore}
                      onChange={(e) => updateConfig({ penaltyScore: Number.parseInt(e.target.value) || 0 })}
                      className="mt-1 max-w-32"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Points deducted for consecutive absences</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* Configuration Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Preview</CardTitle>
              <CardDescription>Current grading setup overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max Score:</span>
                  <span className="font-medium text-foreground">{config.maxScore} pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Passing Score:</span>
                  <span className="font-medium text-foreground">{config.passingScore} pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Late Threshold:</span>
                  <span className="font-medium text-foreground">{config.lateThreshold} min</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Active Rules:</h4>
                {config.rules
                  .filter((rule) => rule.enabled)
                  .map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {getConditionIcon(rule.condition)}
                        <span className="text-muted-foreground">{rule.name}:</span>
                      </div>
                      <span className="font-medium text-foreground">{rule.score} pts</span>
                    </div>
                  ))}
              </div>

              {(config.bonusEnabled || config.penaltyEnabled) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Modifiers:</h4>
                    {config.bonusEnabled && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-500">Bonus Points:</span>
                        <span className="font-medium text-green-500">+{config.bonusScore} pts</span>
                      </div>
                    )}
                    {config.penaltyEnabled && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-500">Penalty Points:</span>
                        <span className="font-medium text-red-500">-{config.penaltyScore} pts</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Example Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Example Scenarios</CardTitle>
              <CardDescription>How students would be scored</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700 dark:text-green-400">On-time arrival:</span>
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {config.rules.find((r) => r.id === "on_time")?.score || 0} pts
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700 dark:text-yellow-400">Late arrival:</span>
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">
                      {config.rules.find((r) => r.id === "late")?.score || 0} pts
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700 dark:text-red-400">Absent:</span>
                    <span className="font-medium text-red-700 dark:text-red-400">
                      {config.rules.find((r) => r.id === "absent")?.score || 0} pts
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>

              <Button variant="outline" onClick={handleReset} disabled={isSaving} className="w-full bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>

              {hasChanges && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    You have unsaved changes. Save your configuration to apply the new grading rules.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
