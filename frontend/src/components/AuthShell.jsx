export default function AuthShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-(--background) text-(--text)">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,115,184,0.35),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="w-full max-w-lg rounded-4xl border-0 border-transparent bg-transparent p-0 shadow-none backdrop-blur-none sm:border sm:border-white/10 sm:bg-(--surface)/55 sm:p-4 sm:backdrop-blur-xl">
          <div className="rounded-3xl border-0 border-transparent bg-transparent p-0 sm:border sm:border-white/10 sm:bg-slate-950/20 sm:p-7">
            <div className="mb-6 flex justify-center">
              <img
                src="/logo.png"
                alt="PC Cinco"
                className="max-h-20 w-auto object-contain"
              />
            </div>

            <div className="flex justify-center">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
