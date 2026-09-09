"use client";

import { FormEvent, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type Status = "idle" | "submitting" | "success" | "error" | "not_configured";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: real visitors never fill this hidden field.
    if (data.get("company")) {
      setStatus("success");
      form.reset();
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setStatus("not_configured");
      return;
    }

    setStatus("submitting");
    const { error } = await supabase.from("leads").insert({
      name: data.get("name"),
      phone: data.get("phone"),
      email: data.get("email"),
      event_type: data.get("event_type"),
      event_date: data.get("event_date") || null,
      message: data.get("message"),
      source: "website",
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    setStatus("success");
    form.reset();
  }

  return (
    <div>
      <div className="pt-16 md:pt-20 pb-2 px-6 md:px-16 text-center">
        <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Let&apos;s Talk</div>
        <h1 className="font-serif text-3xl md:text-[46px] mt-3.5">Book Your Date</h1>
        <p className="text-sm md:text-base text-ink-soft font-light max-w-[520px] mx-auto mt-4">
          Tell us a little about your celebration and we&apos;ll get back to you within 24 hours
          &mdash; or call us directly.
        </p>
      </div>

      <div className="py-14 md:py-16 px-6 md:px-16 grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 md:gap-14 items-start max-w-[1440px] mx-auto">
        {/* INFO COLUMN */}
        <div>
          <div
            className="h-56 md:h-[340px] rounded-md mb-8"
            style={{ background: "linear-gradient(135deg, #f0dcc0, #d7a978 55%, #c98f8a)" }}
          />
          <div className="mb-7">
            <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Call Us Directly</div>
            <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="font-serif text-2xl md:text-3xl block mt-2 text-ink">
              {siteConfig.phone}
            </a>
          </div>
          <div className="mb-7">
            <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Email</div>
            <a href={`mailto:${siteConfig.email}`} className="text-sm md:text-[15px] block mt-2 text-ink-soft">
              {siteConfig.email}
            </a>
          </div>
          <div>
            <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Studio</div>
            <div className="text-sm md:text-[15px] mt-2 text-ink-soft">{siteConfig.address}</div>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-card border border-line rounded-lg p-6 md:p-11">
          {status === "success" ? (
            <div className="text-center py-10">
              <h2 className="font-serif text-2xl mb-2">Thank you!</h2>
              <p className="text-sm text-ink-soft">
                We&apos;ve received your enquiry and will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Honeypot field — hidden from real visitors */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Full Name" name="name" placeholder="Jane Doe" required />
                <Field label="Phone" name="phone" placeholder="+91 00000 00000" required />
              </div>
              <Field label="Email" name="email" type="email" placeholder="jane@email.com" required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs tracking-wider uppercase text-ink-soft block mb-2">
                    Event Type
                  </label>
                  <select
                    name="event_type"
                    required
                    className="w-full px-4 py-3.5 border border-line rounded bg-card text-sm text-ink"
                  >
                    <option value="">Select&hellip;</option>
                    <option>Wedding</option>
                    <option>Pre-Wedding</option>
                    <option>Corporate Event</option>
                    <option>Other</option>
                  </select>
                </div>
                <Field label="Event Date" name="event_date" type="date" />
              </div>
              <div>
                <label className="text-xs tracking-wider uppercase text-ink-soft block mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your celebration…"
                  className="w-full px-4 py-3.5 border border-line rounded bg-card text-sm text-ink"
                />
              </div>

              {status === "not_configured" && (
                <p className="text-xs text-ink-soft bg-cream-3 border border-line rounded px-4 py-3">
                  Online booking isn&apos;t connected yet — please call {siteConfig.phone} or email{" "}
                  {siteConfig.email} directly for now.
                </p>
              )}
              {status === "error" && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-4 py-3">
                  Something went wrong: {errorMessage}. Please call or email us directly.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="bg-gold hover:bg-gold-dark text-white py-4 rounded-full text-sm tracking-widest uppercase transition-colors disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Send Enquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs tracking-wider uppercase text-ink-soft block mb-2">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3.5 border border-line rounded bg-card text-sm text-ink"
      />
    </div>
  );
}
