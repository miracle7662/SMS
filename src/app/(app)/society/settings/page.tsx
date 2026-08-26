"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Switch } from "@/components/ui/Input";

export default function SocietySettingsPage() {
  return (
    <div>
      <PageHeader title="Society Settings" description="Configure financial year, billing cycle, and system preferences" actions={<Button>Save Settings</Button>} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Financial Settings" />
          <CardBody className="flex flex-col gap-4">
            <Select label="Financial Year Start Month" options={[{ label: "April", value: "4" }, { label: "January", value: "1" }]} defaultValue="4" />
            <Select label="Maintenance Billing Cycle" options={[{ label: "Monthly", value: "monthly" }, { label: "Quarterly", value: "quarterly" }]} defaultValue="monthly" />
            <Input label="Bill Due Days" type="number" defaultValue={10} helpText="Days after bill generation for due date" />
            <Input label="Late Fee (% per month)" type="number" defaultValue={2} />
            <Input label="GST Registration No. (if applicable)" placeholder="27AABCG1234H1ZQ" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="General Preferences" />
          <CardBody className="flex flex-col gap-4">
            <Switch checked={true} onChange={() => {}} label="Enable SMS notifications to members" />
            <Switch checked={true} onChange={() => {}} label="Enable email notifications to members" />
            <Switch checked={false} onChange={() => {}} label="Allow online payment gateway" />
            <Switch checked={true} onChange={() => {}} label="Require Police NOC for tenant registration" />
            <Switch checked={false} onChange={() => {}} label="Enable visitor pre-approval by residents" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Numbering Formats" />
          <CardBody className="flex flex-col gap-4">
            <Input label="Maintenance Bill Prefix" defaultValue="GVH/2026-27/" />
            <Input label="Receipt Number Prefix" defaultValue="RCT/26-27/" />
            <Input label="Complaint Number Prefix" defaultValue="CMP/26-27/" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Regional Settings" />
          <CardBody className="flex flex-col gap-4">
            <Select label="Currency" options={[{ label: "Indian Rupee (₹)", value: "inr" }]} defaultValue="inr" />
            <Select label="Date Format" options={[{ label: "DD-MMM-YYYY", value: "1" }, { label: "DD/MM/YYYY", value: "2" }]} defaultValue="1" />
            <Select label="Timezone" options={[{ label: "Asia/Kolkata (IST)", value: "ist" }]} defaultValue="ist" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
