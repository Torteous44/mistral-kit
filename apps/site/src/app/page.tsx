import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-mistral-beige">
      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-mistral-black mb-4">
            mistral-kit
          </h1>
          <p className="text-xl text-mistral-black/70 mb-8">
            A production-minded toolkit for building modern AI web apps with{" "}
            <span className="text-mistral-orange font-semibold">Mistral AI</span> models.
          </p>
          <div className="flex gap-4">
            <Link
              href="/showcase"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-mistral-orange text-white font-medium hover:bg-mistral-orange/90 transition-colors"
            >
              View Showcase
            </Link>

          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-2xl border border-mistral-black/10 p-6">
            <h3 className="text-lg font-semibold text-mistral-black mb-2">
              Unstyled Components
            </h3>
            <p className="text-mistral-black/60 text-sm">
              Fully customizable UI primitives with className props. No opinions, full control over your design.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-mistral-black/10 p-6">
            <h3 className="text-lg font-semibold text-mistral-black mb-2">
              Headless Hooks
            </h3>
            <p className="text-mistral-black/60 text-sm">
              Type-safe React hooks for streaming chat, tool execution, JSON mode, and embeddings.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-mistral-black/10 p-6">
            <h3 className="text-lg font-semibold text-mistral-black mb-2">
              Edge Runtime
            </h3>
            <p className="text-mistral-black/60 text-sm">
              Fast, globally distributed API proxies running on Vercel Edge. Secure API key handling.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-mistral-black/10 p-6">
            <h3 className="text-lg font-semibold text-mistral-black mb-2">
              Tool Calling
            </h3>
            <p className="text-mistral-black/60 text-sm">
              Built-in function calling with automatic execution and Zod schema validation.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl border border-mistral-black/10 p-6">
          <h3 className="text-lg font-semibold text-mistral-black mb-4">Built With</h3>
          <div className="flex flex-wrap gap-3">
            {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Mistral AI"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-mistral-beige text-mistral-black text-sm rounded-lg border border-mistral-black/10"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
