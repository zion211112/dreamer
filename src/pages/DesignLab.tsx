import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFoot,
  CardHead,
  Input,
  Label,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';

const MODULES = [
  { key: 'commons', name: 'Commons' },
  { key: 'network', name: 'Network' },
  { key: 'workbench', name: 'Workbench' },
  { key: 'records', name: 'Records' },
  { key: 'intelligence', name: 'Intelligence' },
];

export function DesignLab() {
  return (
    <div className="p-space-6 space-y-space-6">
      <div>
        <Label variant="canon">Design Lab</Label>
        <h1 className="text-step-4 font-serif text-fg">APT-LABS Visual Engine</h1>
        <p className="text-text-muted text-step--1 max-w-space-6">
          Shared component library and five module themes built on one token system.
        </p>
      </div>

      <Separator />

      <section className="space-y-space-3">
        <Label variant="default">Component library</Label>
        <h2 className="text-step-2 font-serif text-fg">Shared primitives</h2>

        <div className="flex flex-wrap gap-space-3">
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="steel">Steel</Button>
          <Button variant="brass">Brass</Button>
          <Button variant="oxide">Oxide</Button>
        </div>
        <div className="flex flex-wrap gap-space-3 mt-space-3">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </div>

        <Card className="mt-space-4 p-space-4">
          <CardHead>
            <span>Card head</span>
            <Badge variant="canon">active</Badge>
          </CardHead>
          <CardBody>Card body content.</CardBody>
          <CardFoot>
            <Badge variant="default">draft</Badge>
          </CardFoot>
        </Card>

        <div className="flex items-center gap-space-3 mt-space-4">
          <Label>Input</Label>
          <Input placeholder="Type here…" />
        </div>

        <Table className="mt-space-4">
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Module accent token</TableCell>
              <TableCell>--accent</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Separator />

      <section className="space-y-space-3">
        <Label variant="default">Module themes</Label>
        <h2 className="text-step-2 font-serif text-fg">Five module themes</h2>
        <p className="text-text-muted text-step--1">
          Each module sets its accent from the shared palette; change one token and every module updates.
        </p>
        <div className="flex flex-wrap gap-space-4">
          {MODULES.map((module) => (
            <div key={module.key} data-module={module.key} className="p-space-4">
              <Card className="p-space-4">
                <CardHead>
                  <Label variant="default">{module.name}</Label>
                  <Badge variant="accent">module</Badge>
                </CardHead>
                <CardBody>
                  <Button variant="primary" className="w-full">
                    Primary action
                  </Button>
                  <p className="text-text-faint text-step--2 mt-space-2">
                    Accent: {module.key}
                  </p>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
