import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email: email.toLowerCase().trim() }]);

      if (error) {
        if (error.code === "23505") {
          toast({
            description: "Already subscribed",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setEmail("");
        toast({
          description: "Subscribed",
        });
      }
    } catch (error) {
      toast({
        description: "Error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="enter email"
            disabled={isSubmitting}
            className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-foreground/20 rounded-none px-0 py-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground/40 transition-colors text-sm tracking-wide"
          />
        </form>
      </div>
    </div>
  );
};

export default Index;
