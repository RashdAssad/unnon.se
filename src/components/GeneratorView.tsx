"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export default function GeneratorView() {
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
          <Textarea 
            placeholder="Describe the website you want to build (e.g., 'A modern landing page for a SaaS startup with a pricing table and testimonial section')"
            className="min-h-[150px] resize-none"
          />
          <div className="flex justify-end">
            <Button size="lg">
              Generate Website
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
