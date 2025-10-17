import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        toast.error("Access denied");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdminStatus();
  }, [navigate]);

  const handleSendTestEmail = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-daily-email");
      
      if (error) throw error;
      
      toast.success("Test email sent successfully!");
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send test email: " + error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Daily Email Test</h3>
            <p className="text-sm text-muted-foreground">
              Send a test email to all subscribers immediately
            </p>
          </div>
          <div className="p-6 pt-0">
            <Button 
              onClick={handleSendTestEmail}
              disabled={sending}
              size="lg"
            >
              {sending ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
