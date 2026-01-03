"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"

type GenerationStatus = "idle" | "generating" | "completed"

export default function GeneratorView() {
  const [prompt, setPrompt] = React.useState("")
  const [status, setStatus] = React.useState<GenerationStatus>("idle")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setStatus("generating")
    
    // Mock simulation of generation process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    setStatus("completed")
  }

  const isGenerating = status === "generating"

  return (
    <div className="container py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generator Mode
          </CardTitle>
          <CardDescription>
            Describe your vision, and our AI will scaffold a complete Next.js website for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "completed" ? (
             <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center animate-in fade-in zoom-in duration-500">
                <div className="text-2xl font-bold text-green-600">Generation Complete!</div>
                <p className="text-muted-foreground">Here is your generated website.</p>
                <Button variant="outline" onClick={() => setStatus("idle")}>Generate Another</Button>
             </div>
          ) : (
            <>
              <Textarea 
                placeholder="Describe the website you want to build (e.g., 'A modern landing page for a SaaS startup with a pricing table and testimonial section')"
                className="min-h-[150px] resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <div className="flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Website"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}