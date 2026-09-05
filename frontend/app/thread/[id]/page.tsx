import React from "react";
import ThreadView from "@/components/thread/ThreadView";

interface ThreadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const resolvedParams = await params;
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <ThreadView id={resolvedParams.id} />
    </div>
  );
}
