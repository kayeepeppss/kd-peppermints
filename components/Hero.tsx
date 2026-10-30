import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 overflow-hidden bg-transparent">
      
      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-peppermint-wash rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E8927C]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>
      
      {/* Center Content */}
      <div className="max-w-3xl text-center relative z-10 mt-auto mb-auto">
        
        <span className="inline-block py-2 px-5 rounded-full bg-white/80 backdrop-blur-md border border-white/50 text-peppermint-deep text-sm font-bold tracking-wide mb-8 shadow-sm">
          ☘︎ Small doses, real care.
        </span>

        <h1 className="font-heading text-6xl md:text-8xl text-charcoal leading-tight tracking-tight drop-shadow-md">
          Your daily<br />wellness, refined.
        </h1>

        <p className="mt-8 text-lg md:text-xl text-neutralgrey max-w-xl mx-auto">
          Premium essentials, carefully sourced and delivered with warmth.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/group-buy"
            className="bg-warmpop-coral hover:bg-warmpop-caramel hover:-translate-y-1 text-white font-bold px-10 py-4 rounded-full transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(232,146,124,0.6)] w-full sm:w-auto"
          >
            Shop Group Buy
          </Link>
          <Link
            href="/on-hand"
            className="bg-white border border-peppermint-wash text-charcoal hover:bg-peppermint-wash font-bold px-10 py-4 rounded-full transition-all duration-300 w-full sm:w-auto shadow-sm"
          >
            Shop On Hand
          </Link>
        </div>

      </div>
    </section>
  )
}