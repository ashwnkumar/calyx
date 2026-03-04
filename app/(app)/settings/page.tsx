import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePassphraseDialog } from "@/components/change-passphrase-dialog";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and security settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your master passphrase and encryption settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Master Passphrase</p>
              <p className="text-sm text-muted-foreground">
                Change your master passphrase used to encrypt all secrets
              </p>
            </div>
            <ChangePassphraseDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
