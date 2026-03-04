import { Link } from 'react-router-dom';

export function CheckoutPlaceholderPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl" style={{ fontWeight: 400 }}>
          Checkout Placeholder
        </h1>

        <section className="mt-8 rounded-lg border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="mt-1 text-lg">Paid Plan</p>

          <p className="mt-4 text-sm text-muted-foreground">Price</p>
          <p className="mt-1 text-lg">$20/mo</p>

          <p className="mt-4 text-sm text-muted-foreground">Total</p>
          <p className="mt-1 text-2xl">$20</p>

          <p className="mt-6 text-xs text-muted-foreground">
            Payments are not live yet. This screen is a non-functional checkout placeholder.
          </p>

          <Link
            to="/pricing"
            className="mt-6 inline-flex rounded border border-border px-4 py-2 text-sm transition-colors hover:bg-card/70"
          >
            Back to Pricing
          </Link>
        </section>
      </main>
    </div>
  );
}
