"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"
import PreviewCard from "./PreviewCard"

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
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
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
          </CardContent>
        </Card>

        {status === "completed" && (
           <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Generated Result</h2>
                <Button variant="ghost" size="sm" onClick={() => setStatus("idle")}>Clear Result</Button>
             </div>
             <PreviewCard 
               title="Generated Project" 
               description={`Based on: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`} 
             />
           </div>
        )}
      </div>
    </div>
  )
}