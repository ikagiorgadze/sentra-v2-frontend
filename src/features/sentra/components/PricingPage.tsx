export function PricingPage() {
  const handleCheckoutClick = () => {
    window.history.pushState({}, '', '/checkout');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Pricing</p>
          <h1 className="mt-2 text-3xl" style={{ fontWeight: 400 }}>
            Simple pricing
          </h1>
        </div>

        <section className="rounded-lg border border-border bg-card p-8">
          <h2 className="text-2xl" style={{ fontWeight: 500 }}>
            Paid Plan
          </h2>
          <p className="mt-3 text-4xl">$20/mo</p>

          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Continuous cross-channel monitoring</li>
            <li>Intelligence brief generation</li>
            <li>Sentiment and narrative trend tracking</li>
            <li>Risk signal highlights and summaries</li>
          </ul>

          <p className="mt-6 text-xs text-muted-foreground">
            Checkout is placeholder-only in this build. No real charges are processed.
          </p>

          <button
            type="button"
            onClick={handleCheckoutClick}
            className="mt-6 rounded bg-[#3FD6D0] px-5 py-2.5 text-sm text-[#0F1113] transition-colors hover:bg-[#3FD6D0]/90"
          >
            Continue to Checkout
          </button>
        </section>
      </main>
    </div>
  );
}
