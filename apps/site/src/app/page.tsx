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


      </main>
    </div>
  );
}
