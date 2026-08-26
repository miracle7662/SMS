"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Check, User, MapPin, Tag, Clock, Paperclip, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, Select } from "@/components/ui/Input";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { complaints } from "@/lib/mock-data";
import { formatDateTime, cn } from "@/lib/utils";

const FLOW = ["Created", "Assigned", "In Progress", "Resolved", "Closed"];

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) return notFound();

  const currentIdx = complaint.status === "Open" ? 0 : complaint.status === "In Progress" ? 2 : complaint.status === "Resolved" ? 3 : 4;

  const timeline = [
    { label: "Complaint Created", by: complaint.complainant, time: complaint.createdDate },
    ...(complaint.assignedTo ? [{ label: `Assigned to ${complaint.assignedTo}`, by: "Society Admin", time: complaint.createdDate }] : []),
    ...(currentIdx >= 2 ? [{ label: "Work In Progress", by: complaint.assignedTo ?? "Team", time: complaint.createdDate }] : []),
    ...(currentIdx >= 3 ? [{ label: "Marked Resolved", by: complaint.assignedTo ?? "Team", time: complaint.createdDate }] : []),
    ...(currentIdx >= 4 ? [{ label: "Complaint Closed", by: "Society Admin", time: complaint.createdDate }] : []),
  ];

  return (
    <div>
      <PageHeader
        title={complaint.complaintNo}
        description={complaint.category}
        actions={
          <>
            <Select
              wrapperClassName="w-40"
              options={["Open", "In Progress", "Resolved", "Closed"].map((s) => ({ label: s, value: s }))}
              defaultValue={complaint.status}
            />
            <Button>Update Status</Button>
          </>
        }
      />

      {/* Status flow */}
      <Card className="mb-5">
        <CardBody>
          <div className="table-scroll scrollbar-none">
            <div className="flex min-w-max items-center gap-1">
              {FLOW.map((label, i) => (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                        i <= currentIdx ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                      )}
                    >
                      {i < currentIdx ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={cn("text-[11px]", i <= currentIdx ? "font-medium text-[var(--color-text)]" : "text-[var(--color-text-muted)]")}>{label}</span>
                  </div>
                  {i < FLOW.length - 1 && <div className="mx-2 h-px w-10 sm:w-16 bg-[var(--color-border)]" />}
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card>
            <CardHeader title="Complaint Information" />
            <CardBody className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <InfoBlock icon={User} label="Complainant" value={complaint.complainant} />
                <InfoBlock icon={MapPin} label="Flat" value={complaint.flatNo} />
                <InfoBlock icon={Tag} label="Category" value={complaint.category} />
                <InfoBlock icon={Clock} label="Created" value={formatDateTime(complaint.createdDate)} />
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">Description</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{complaint.description}</p>
              </div>
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                  <Paperclip className="h-3.5 w-3.5" /> Attachments
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">No attachments uploaded.</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Add Internal Remark" />
            <CardBody className="flex flex-col gap-3">
              <Textarea placeholder="Add a note visible only to committee members..." />
              <div className="flex justify-end">
                <Button size="sm">
                  <Send className="h-3.5 w-3.5" /> Post Remark
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Assigned To" />
            <CardBody>
              <Select
                options={["Rohit (Plumber)", "Santosh (Electrician)", "Housekeeping Team", "Security Head"].map((v) => ({ label: v, value: v }))}
                defaultValue={complaint.assignedTo}
                placeholder="Unassigned"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Status History" />
            <div className="flex flex-col gap-4 p-5">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-[var(--color-border)]" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium text-[var(--color-text)]">{t.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">by {t.by} · {formatDateTime(t.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="text-sm font-medium text-[var(--color-text)]">{value}</p>
    </div>
  );
}
