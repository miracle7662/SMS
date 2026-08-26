import { Building2, MapPin, Phone, Mail, Landmark, Users, Home } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";
import { society, buildings } from "@/lib/mock-data";

export default function SocietyProfilePage() {
  return (
    <div>
      <PageHeader
        title="Society Profile"
        description="Manage your society's registration and contact details"
        actions={<Button>Save Changes</Button>}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Basic Information" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Society Name" defaultValue={society.name} required wrapperClassName="sm:col-span-2" />
            <Input label="Registration Number" defaultValue={society.registrationNo} required />
            <Select
              label="Registration Type"
              options={[{ label: "Co-operative Housing Society", value: "chs" }, { label: "Apartment Owners Association", value: "aoa" }]}
              defaultValue="chs"
            />
            <Textarea label="Registered Address" defaultValue={society.address} wrapperClassName="sm:col-span-2" />
            <Input label="City" defaultValue="Pune" />
            <Input label="State" defaultValue="Maharashtra" />
            <Input label="Pincode" defaultValue="411045" />
            <Input label="PAN Number" defaultValue="AABCG1234H" />
            <Input label="Contact Number" defaultValue="+91 98220 11234" icon={<Phone className="h-4 w-4" />} />
            <Input label="Email Address" defaultValue="office@greenvalleychs.org" icon={<Mail className="h-4 w-4" />} />
          </CardBody>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Society Logo" />
            <CardBody>
              <FileUpload variant="image" helpText="Recommended 400x400px, PNG or JPG" />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="At a Glance" />
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-[var(--color-text-muted)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">{society.totalBuildings} Buildings</span>
              </div>
              <div className="flex items-center gap-3">
                <Home className="h-4 w-4 text-[var(--color-text-muted)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">{society.totalFlats} Flats</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-[var(--color-text-muted)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">421 Members</span>
              </div>
              <div className="flex items-center gap-3">
                <Landmark className="h-4 w-4 text-[var(--color-text-muted)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">Registered 2011</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[var(--color-text-muted)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">{society.city}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader title="Buildings Overview" description="Quick summary of all buildings in this society" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <div key={b.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">{b.name}</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {b.wings.length} Wing(s) · {b.totalFloors} Floors · {b.totalFlats} Flats
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
