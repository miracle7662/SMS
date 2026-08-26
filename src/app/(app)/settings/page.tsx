"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Input, Select, Switch } from "@/components/ui/Input";
import { initials } from "@/lib/utils";

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and application preferences" />

      <Card>
        <Tabs
          tabs={[
            { key: "profile", label: "My Profile" },
            { key: "security", label: "Security" },
            { key: "notifications", label: "Notifications" },
            { key: "appearance", label: "Appearance" },
          ]}
          onChange={setTab}
        />
        <CardBody>
          {tab === "profile" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-semibold text-white">
                  {initials("Anil Deshmukh")}
                </div>
                <Button variant="outline" size="sm">Change Photo</Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Full Name" defaultValue="Anil Deshmukh" />
                <Input label="Email" type="email" defaultValue="anil.admin@greenvalley.org" />
                <Input label="Mobile Number" defaultValue="+91 98220 11001" />
                <Select label="Role" options={[{ label: "Society Admin", value: "admin" }]} defaultValue="admin" disabled />
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="flex max-w-md flex-col gap-4">
              <Input label="Current Password" type="password" />
              <Input label="New Password" type="password" />
              <Input label="Confirm New Password" type="password" />
              <Switch checked={true} onChange={() => {}} label="Enable Two-Factor Authentication" />
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="flex flex-col gap-4">
              <Switch checked={true} onChange={() => {}} label="Email notifications for new complaints" />
              <Switch checked={true} onChange={() => {}} label="Email notifications for payments" />
              <Switch checked={false} onChange={() => {}} label="SMS alerts for defaulters" />
              <Switch checked={true} onChange={() => {}} label="Weekly summary report" />
            </div>
          )}

          {tab === "appearance" && (
            <div className="flex flex-col gap-4">
              <Select label="Theme" options={[{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }, { label: "System", value: "system" }]} defaultValue="light" />
              <Select label="Density" options={[{ label: "Comfortable", value: "comfortable" }, { label: "Compact", value: "compact" }]} defaultValue="comfortable" />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
