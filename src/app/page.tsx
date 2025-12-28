import GeneratorView from "@/components/GeneratorView"

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="bg-muted/50 py-20">
        <div className="container text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            AI Website Replicator & Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-[42rem] mx-auto">
            Instantly scaffold high-quality websites. Clone existing designs or generate new concepts from a text prompt.
          </p>
        </div>
      </section>
      
      <GeneratorView />
    </div>
  )
}