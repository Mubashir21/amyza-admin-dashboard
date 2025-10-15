"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  createInvitation,
  getAllInvitations,
  revokeInvitation,
  InvitationWithInviter,
} from "@/lib/invite-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Clock, CheckCircle, XCircle, Copy, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export function InviteManagement() {
  const { user, adminProfile } = useAuth();
  const [invitations, setInvitations] = useState<InvitationWithInviter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "viewer">("viewer");

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const data = await getAllInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Error loading invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !adminProfile) {
      toast.error("You must be logged in");
      return;
    }

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsCreating(true);
    try {
      const inviterName = `${adminProfile.first_name} ${adminProfile.last_name}`;
      const { inviteLink } = await createInvitation(
        email,
        role,
        user.id,
        inviterName
      );

      // Reload invitations
      await loadInvitations();

      // Reset form and close dialog
      setEmail("");
      setRole("viewer");
      setDialogOpen(false);

      toast.success("Invitation created!", {
        description: "Invite link copied to clipboard",
      });
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink);
    } catch (error) {
      console.error("Error creating invitation:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create invitation";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyInviteLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/signup?invite=${token}`;
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied!");
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      await revokeInvitation(id);
      await loadInvitations();
      toast.success("Invitation revoked");
    } catch (error) {
      console.error("Error revoking invitation:", error);
      toast.error("Failed to revoke invitation");
    }
  };

  const getStatusBadge = (invitation: InvitationWithInviter) => {
    if (invitation.used) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Used</Badge>;
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
    }
    
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>View and manage sent invitations</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Invitation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Invitation</DialogTitle>
                <DialogDescription>
                  Invite a new user to join the admin dashboard
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvitation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value: "admin" | "viewer") => setRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Invitation"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No invitations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{invitation.email}</p>
                    <Badge variant="outline">{invitation.role}</Badge>
                    {getStatusBadge(invitation)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Invited by {invitation.inviter_name} on {formatDate(invitation.created_at)}
                  </p>
                  {invitation.used && invitation.used_at && (
                    <p className="text-sm text-green-600 mt-1">
                      Used on {formatDate(invitation.used_at)}
                    </p>
                  )}
                  {!invitation.used && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Expires on {formatDate(invitation.expires_at)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {!invitation.used && new Date(invitation.expires_at) > new Date() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyInviteLink(invitation.token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  {!invitation.used && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeInvitation(invitation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

