const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--muted)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Construction Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg">
            <div className="w-20 h-20 bg-[var(--card)] rounded-full flex items-center justify-center">
              <div className="relative">
                {/* Hammer */}
                <div className="w-6 h-8 bg-[var(--secondary)] rounded-sm absolute -left-4 -top-2 rotate-45"></div>
                <div className="w-8 h-4 bg-[var(--foreground)] rounded-sm absolute -left-6 top-0"></div>
                {/* Wrench */}
                <div className="w-6 h-2 bg-[var(--foreground)] rounded-sm absolute -right-4 top-1 rotate-12"></div>
                <div className="w-4 h-4 border-2 border-[var(--foreground)] rounded-full absolute -right-6 top-0 border-l-transparent"></div>
              </div>
            </div>
          </div>

          {/* Pulsing animation */}
          <div className="absolute inset-0 w-32 h-32 mx-auto bg-[var(--primary)] rounded-full opacity-20 animate-ping"></div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-8xl font-black text-[var(--primary)] tracking-tight">
              404
            </h1>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Under Construction
            </h2>
          </div>

          <p className="text-lg text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
            Oops! The page you're looking for is currently under construction.
            Our team is working hard to build something amazing here.
          </p>

          {/* Progress Bar */}
          <div className="max-w-sm mx-auto space-y-2">
            <div className="w-full bg-[var(--muted)] rounded-full h-3 border border-[var(--border)]">
              <div
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-3 rounded-full animate-pulse"
                style={{ width: "65%" }}
              ></div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Construction Progress: 65%
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button
              className="px-6 py-3 bg-[var(--primary)] text-[var(--background)] rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
            <button
              className="px-6 py-3 bg-[var(--secondary)] text-[var(--background)] rounded-lg font-semibold hover:bg-[var(--secondary-dark)] transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
              onClick={() => (window.location.href = "/")}
            >
              Return Home
            </button>
          </div>

          {/* Construction Notice */}
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--secondary-light)] border border-[var(--secondary)]/20 rounded-full">
              <div className="w-2 h-2 bg-[var(--secondary)] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[var(--foreground)]">
                Expected completion: Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-8 w-4 h-4 bg-[var(--primary)]/20 rounded-full animate-bounce"></div>
        <div
          className="absolute top-12 right-12 w-6 h-6 bg-[var(--secondary)]/20 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="absolute top-1/3 left-16 w-3 h-3 bg-[var(--primary)]/30 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
