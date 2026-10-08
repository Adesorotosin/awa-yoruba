"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";

type CheckoutData = {
  alreadyPaid: boolean;
  booking: {
    id: string;
    scheduledAt: string;
    durationMinutes: number;
    priceAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    paymentStatus: string;
    tutorProfile: { displayName: string | null } | null;
  };
  priceAmount?: number;
  discountAmount: number;
  amountDue: number;
  currency?: string;
  availableCredit: number;
};

function money(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const [bookingId, setBookingId] = useState("");
  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void params.then(({ bookingId: id }) => setBookingId(id));
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;

    async function load() {
      try {
        const response = await fetch(`/api/learner/checkout/${bookingId}`, { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = `/login?redirect=/learner/checkout/${bookingId}`;
            return;
          }
          throw new Error(payload.error ?? "Unable to load checkout.");
        }

        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load checkout.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [bookingId]);

  async function completeTestPayment() {
    if (!bookingId) return;

    setPaying(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/learner/payments/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error ?? "Unable to complete payment.");

      setSuccess("Payment completed. Your lesson is now confirmed.");
      setData((current) =>
        current
          ? {
              ...current,
              alreadyPaid: true,
              amountDue: 0,
              discountAmount: payload.booking.discountAmount,
              booking: payload.booking,
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete payment.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFF8ED] text-[#17231E]">Loading checkout...</main>;
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#FFF8ED] px-5 py-16 text-[#17231E]">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center">
          <p className="font-bold text-red-700">{error || "Unable to load checkout."}</p>
          <Link href="/learner/dashboard" className="mt-5 inline-flex rounded-xl bg-[#114B33] px-5 py-3 text-sm font-black text-white">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  const price = data.priceAmount ?? data.booking.priceAmount;
  const discount = data.discountAmount;
  const due = data.amountDue;

  return (
    <main className="min-h-screen bg-[#FFF8ED] px-5 py-12 text-[#17231E] sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/learner/dashboard" className="text-sm font-bold text-[#114B33]">← Back to dashboard</Link>

        <div className="mt-6 rounded-[2rem] border border-[#E4DBCD] bg-white p-7 shadow-sm sm:p-9">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF5EF] text-[#114B33]">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B07B22]">Checkout</p>
              <h1 className="mt-1 text-3xl font-black">Complete your lesson payment</h1>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-[#FFF8ED] p-5">
            <p className="font-black">{data.booking.tutorProfile?.displayName ?? "Your tutor"}</p>
            <p className="mt-1 text-sm text-[#6B5B4B]">{formatDate(data.booking.scheduledAt)}</p>
            <p className="mt-1 text-sm text-[#6B5B4B]">{data.booking.durationMinutes}-minute lesson</p>
          </div>

          <div className="mt-6 space-y-3 border-t border-[#E8DECE] pt-6 text-sm">
            <div className="flex justify-between gap-4"><span>Lesson price</span><strong>{money(price, data.currency ?? data.booking.currency)}</strong></div>
            <div className="flex justify-between gap-4 text-[#114B33]"><span>Learning credit</span><strong>-{money(discount, data.currency ?? data.booking.currency)}</strong></div>
            <div className="flex justify-between gap-4 border-t border-[#E8DECE] pt-4 text-lg"><span className="font-black">Amount to pay</span><strong>{money(due, data.currency ?? data.booking.currency)}</strong></div>
          </div>

          {discount > 0 && (
            <div className="mt-6 flex gap-3 rounded-2xl bg-[#EFF5EF] p-4 text-sm text-[#114B33]">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <p>Your learning credit has been applied as a discount. It is non-cash and can only reduce eligible learning charges.</p>
            </div>
          )}

          {success && (
            <div className="mt-6 flex gap-3 rounded-2xl bg-[#EFF5EF] p-4 font-bold text-[#114B33]">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {!data.alreadyPaid ? (
            <div className="mt-7">
              <button
                type="button"
                onClick={completeTestPayment}
                disabled={paying}
                className="w-full rounded-2xl bg-[#114B33] px-5 py-4 text-sm font-black text-white disabled:opacity-60"
              >
                {paying ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span> : due === 0 ? "Apply credit & confirm lesson" : `Pay ${money(due, data.currency ?? data.booking.currency)} (test mode)`}
              </button>
              <p className="mt-3 text-center text-xs text-[#8A7968]">Development mode only. No real money is charged yet.</p>
            </div>
          ) : (
            <Link href="/learner/dashboard" className="mt-7 inline-flex w-full justify-center rounded-2xl bg-[#114B33] px-5 py-4 text-sm font-black text-white">Return to dashboard</Link>
          )}
        </div>
      </div>
    </main>
  );
}
