import { isGoogleSignInEnabled } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/actions/user.actions";

type AuthCardProps = {
  title: string;
  description: string;
  callbackUrl: string;
  children: React.ReactNode;
};

const AuthCard = ({ title, description, callbackUrl, children }: AuthCardProps) => (
  <Card>
    <CardHeader className="text-center">
      <CardTitle className="font-serif text-2xl font-normal">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {isGoogleSignInEnabled && (
        <>
          <form action={signInWithGoogle}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="outline" className="w-full">
              Continue with Google
            </Button>
          </form>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
      {children}
    </CardContent>
  </Card>
);

export default AuthCard;
