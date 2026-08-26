"use client";

import { useRouter } from "next/navigation";
import { User, Home, Handshake, CalendarRange, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";
import { StatusBadge } from "@/components/ui/Badge";

export default function NewTenantPage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader title="Add Tenant" description="Register a new tenant against a flat" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/members/tenants");
        }}
        className="flex flex-col gap-5"
      >
        {/* Tenant Information */}
        <Card>
          <CardHeader title="Tenant Information" description="Basic details of the tenant" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Tenant Name" required wrapperClassName="sm:col-span-2" placeholder="e.g. Rohit Kambli" />
            <Input label="Mobile Number" required placeholder="9876543210" />
            <Input label="Email" type="email" placeholder="tenant@email.com" />
            <Textarea label="Permanent Address" wrapperClassName="sm:col-span-2" placeholder="Full address" />
            <div className="sm:col-span-2">
              <FileUpload variant="image" label="Tenant Photo" helpText="Passport size photo, JPG or PNG" />
            </div>
          </CardBody>
        </Card>

        {/* Flat Information */}
        <Card>
          <CardHeader title="Flat Information" description="Flat the tenant will occupy" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Society" required options={[{ label: "Green Valley Co-operative Housing Society", value: "SOC001" }]} defaultValue="SOC001" />
            <Select label="Building" required options={[{ label: "Sunrise Tower A", value: "a" }, { label: "Sunrise Tower B", value: "b" }]} placeholder="Select building" />
            <Select label="Wing" required options={[{ label: "A", value: "A" }, { label: "B", value: "B" }]} placeholder="Select wing" />
            <Select label="Flat" required options={[{ label: "A-1203", value: "A-1203" }]} placeholder="Select flat" />
            <Input label="Owner Name" wrapperClassName="sm:col-span-2" disabled placeholder="Auto-filled from flat selection" />
          </CardBody>
        </Card>

        {/* Broker Information */}
        <Card>
          <CardHeader title="Broker Information" description="Optional — if the tenancy was arranged through a broker" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Broker Name" placeholder="e.g. Sanjay Estate Agency" />
            <Input label="Broker Mobile" placeholder="9876543210" />
            <Textarea label="Broker Address" wrapperClassName="sm:col-span-2" />
          </CardBody>
        </Card>

        {/* Rental Information */}
        <Card>
          <CardHeader title="Rental Information" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Rent Start Date" type="date" required />
            <Input label="Rent End Date" type="date" required />
            <Input label="Monthly Rent (₹)" type="number" placeholder="e.g. 32000" />
            <Input label="Security Deposit (₹)" type="number" placeholder="e.g. 200000" />
          </CardBody>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader title="Documents" description="Upload required verification documents" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FileUpload label="Legal Rent Agreement" />
            <FileUpload label="Police NOC" />
            <FileUpload label="Aadhaar Card" />
            <FileUpload label="PAN Card" />
            <FileUpload label="Other Documents" multiple />
            <FileUpload label="Family Member Documents" multiple />
          </CardBody>
        </Card>

        <div className="flex flex-wrap items-center justify-end gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <Button type="button" variant="outline" onClick={() => router.push("/members/tenants")}>
            Cancel
          </Button>
          <Button type="button" variant="outline">
            Save &amp; New
          </Button>
          <Button type="submit">Save Tenant</Button>
        </div>
      </form>
    </div>
  );
}
