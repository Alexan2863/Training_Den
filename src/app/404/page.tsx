const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--muted)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Elegant Animated Icon */}
        <div className="relative mb-12">
          <div className="w-40 h-40 mx-auto bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-full flex items-center justify-center shadow-2xl">
            <div className="w-24 h-24 bg-[var(--card)] rounded-full flex items-center justify-center shadow-inner">
              <div className="relative transform rotate-12">
                {/* Simplified Construction Elements */}
                <div className="w-8 h-10 bg-[var(--secondary)] rounded-sm absolute -left-6 -top-4 rotate-45 transform origin-center"></div>
                <div className="w-2 h-6 bg-[var(--foreground)] rounded-full absolute -right-4 top-1 rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Subtle pulsing glow */}
          <div className="absolute inset-0 w-40 h-40 mx-auto bg-[var(--primary)] rounded-full opacity-10 animate-pulse"></div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-9xl font-black text-[var(--primary)] tracking-tighter leading-none">
              404
            </h1>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-[var(--foreground)] tracking-tight">
                Page Under Construction
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] mx-auto rounded-full"></div>
            </div>
          </div>

          <p className="text-xl text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed font-light">
            We're crafting something extraordinary here. Please check back soon
            while we put the finishing touches.
          </p>

          {/* Simple Navigation Hint */}
          <div className="pt-8">
            <p className="text-sm text-[var(--muted-foreground)] font-medium">
              Return to{" "}
              <a
                href="/"
                className="text-[var(--primary)] hover:text-[var(--primary-dark)] underline transition-colors"
              >
                Dashboard
              </a>
            </p>
          </div>
        </div>

        {/* Minimal Decorative Elements */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-[var(--primary)]/20 rounded-full animate-bounce"></div>
        <div
          className="absolute bottom-20 right-12 w-4 h-4 bg-[var(--secondary)]/20 rounded-full animate-bounce"
          style={{ animationDelay: "0.3s" }}
        ></div>
        <div
          className="absolute top-1/2 left-20 w-2 h-2 bg-[var(--primary)]/30 rounded-full animate-bounce"
          style={{ animationDelay: "0.6s" }}
        ></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
