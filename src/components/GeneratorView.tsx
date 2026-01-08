"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, Globe } from "lucide-react"
import PreviewCard from "./PreviewCard"

type GenerationStatus = "idle" | "generating" | "completed"
type ViewMode = "generator" | "replicator"

export default function GeneratorView() {
  const [mode, setMode] = React.useState<ViewMode>("generator")
  const [prompt, setPrompt] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [status, setStatus] = React.useState<GenerationStatus>("idle")
  const [result, setResult] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleGenerate = async () => {
    const input = mode === "generator" ? prompt : url
    if (!input.trim()) return

    setStatus("generating")
    setError(null)
    
    try {
      const endpoint = mode === "generator" ? "/api/generate" : "/api/replicate"
      const body = mode === "generator" ? { prompt: input } : { url: input }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to generate website")
      }

      const data = await response.json()
      setResult(data.content)
      setStatus("completed")
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      setStatus("idle")
    }
  }

  const isGenerating = status === "generating"

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Mode Switcher */}
        <div className="flex justify-center">
          <div className="bg-muted p-1 rounded-lg inline-flex" role="tablist">
            <button
              role="tab"
              aria-selected={mode === "generator"}
              onClick={() => setMode("generator")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "generator" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Generator
            </button>
            <button
              role="tab"
              aria-selected={mode === "replicator"}
              onClick={() => setMode("replicator")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "replicator" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Replicator
            </button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === "generator" ? (
                <>
                  <Sparkles className="w-5 h-5 text-primary" />
                  Generator Mode
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5 text-primary" />
                  Replicator Mode
                </>
              )}
            </CardTitle>
            <CardDescription>
              {mode === "generator" 
                ? "Describe your vision, and our AI will scaffold a complete Next.js website for you."
                : "Enter an existing website URL to replicate its structure using our AI engine."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "generator" ? (
              <Textarea 
                placeholder="Describe the website you want to build (e.g., 'A modern landing page for a SaaS startup with a pricing table and testimonial section')"
                className="min-h-[150px] resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
            ) : (
              <Input
                placeholder="Enter website URL to replicate (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isGenerating}
              />
            )}
            
            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={handleGenerate} 
                disabled={isGenerating || (mode === "generator" ? !prompt.trim() : !url.trim())}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "generator" ? "Generating..." : "Replicating..."}
                  </>
                ) : (
                  mode === "generator" ? "Generate Website" : "Replicate Website"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        {status === "completed" && result && (
           <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Generated Result</h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  setStatus("idle")
                  setResult(null)
                }}>Clear Result</Button>
             </div>
             <PreviewCard 
               title="Generated Project" 
               description={`AI Response: ${result.substring(0, 100)}...`} 
               content={result}
             />
           </div>
        )}
      </div>
    </div>
  )
}