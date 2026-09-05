"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Email } from "@/lib/types";
import { getMockEmail } from "@/lib/mockAdapter";
import EmailPreview from "../inbox/EmailPreview";

interface ThreadViewProps {
  id: string;
}

export default function ThreadView({ id }: ThreadViewProps) {
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMockEmail(id)
      .then((res) => setEmail(res))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <Link
          href="/inbox"
          style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          &larr; Back to Inbox
        </Link>
      </div>

      <div className="card" style={{ padding: "0" }}>
        {loading ? (
          <div style={{ padding: "2rem", color: "var(--text-muted)" }}>Loading thread {id}...</div>
        ) : (
          <EmailPreview email={email} />
        )}
      </div>
    </div>
  );
}
