import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Smartphone, Monitor, Code as CodeIcon, Eye } from "lucide-react"

interface PreviewCardProps {
  title: string
  description: string
  content?: string
}

export default function PreviewCard({ title, description, content }: PreviewCardProps) {
  const [view, setView] = React.useState<"preview" | "code">("preview")

  return (
    <Card className="overflow-hidden border-2 border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-muted/50 py-3 border-b flex flex-row items-center justify-between">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-1">
          <Button 
            variant={view === "preview" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-8 gap-1.5"
            onClick={() => setView("preview")}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs">View Preview</span>
          </Button>
          <Button 
            variant={view === "code" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-8 gap-1.5"
            onClick={() => setView("code")}
          >
            <CodeIcon className="h-3.5 w-3.5" />
            <span className="text-xs">View Code</span>
          </Button>
        </div>
        <div className="flex gap-1 ml-4 border-l pl-4">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 aspect-video bg-white relative group overflow-hidden">
        {view === "preview" ? (
          <div 
            role="img" 
            aria-label="Preview of generated website"
            className="w-full h-full bg-slate-100 flex flex-col"
          >
            {/* Mock Website UI */}
            <div className="h-8 bg-white border-b flex items-center px-4 gap-2">
               <div className="w-2 h-2 rounded-full bg-red-400" />
               <div className="w-2 h-2 rounded-full bg-yellow-400" />
               <div className="w-2 h-2 rounded-full bg-green-400" />
               <div className="w-24 h-3 bg-slate-100 rounded ml-4" />
            </div>
            <div className="flex-1 p-6 space-y-4">
               <div className="w-1/2 h-6 bg-primary/20 rounded mx-auto" />
               <div className="w-3/4 h-3 bg-slate-200 rounded mx-auto" />
               <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="h-20 bg-slate-200 rounded" />
                  <div className="h-20 bg-slate-200 rounded" />
                  <div className="h-20 bg-slate-200 rounded" />
               </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-950 p-4 overflow-auto font-mono text-xs text-slate-300">
            <pre className="whitespace-pre-wrap">{content || "// No code available"}</pre>
          </div>
        )}
        
        {view === "preview" && (
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button size="sm" className="gap-2">
               <ExternalLink className="h-4 w-4" />
               Open Preview
             </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex justify-between">
        <Button variant="outline" size="sm" disabled={!content}>Export Code</Button>
        <Button size="sm">Publish Site</Button>
      </CardFooter>
    </Card>
  )
}
