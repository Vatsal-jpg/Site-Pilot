import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { mockTeam } from "@/data/mockData";
import { UserPlus, MoreVertical } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const pendingInvites = [
  { email: "alex@acme.com", role: "editor", sentAt: "2 days ago" },
];

const Team = () => {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild><Button size="sm"><UserPlus className="mr-2 h-4 w-4" /> Invite Member</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite Team Member</DialogTitle><DialogDescription>Send an invitation to join your organization</DialogDescription></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Email</Label><Input placeholder="colleague@company.com" /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option>Editor</option>
                  <option>Admin</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            <DialogFooter><Button onClick={() => setInviteOpen(false)}>Send Invite</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members */}
      <Card className="rounded-xl shadow-sm mb-6">
        <CardHeader><CardTitle className="text-lg">Members</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTeam.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{member.role}</Badge></TableCell>
                  <TableCell>
                    {member.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Change Role</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader><CardTitle className="text-lg">Pending Invites</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvites.map((inv) => (
                <TableRow key={inv.email}>
                  <TableCell>{inv.email}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{inv.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{inv.sentAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Team;
