import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ESOTERIC_QUOTES = [
  "The cave you fear to enter holds the treasure you seek.",
  "What is below is like what is above, and what is above is like what is below.",
  "He who knows others is wise; he who knows himself is enlightened.",
  "The way that can be spoken of is not the constant way.",
  "Only when you drink from the river of silence shall you indeed sing.",
  "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.",
  "The obstacle is the path.",
  "Not all those who wander are lost.",
  "The wound is the place where the Light enters you.",
  "In the beginner's mind there are many possibilities, in the expert's mind there are few.",
  "Everything you can imagine is real.",
  "He who looks outside dreams; he who looks inside awakens.",
  "The privilege of a lifetime is to become who you truly are.",
  "Silence is the language of God, all else is poor translation.",
  "When the student is ready, the teacher will appear.",
  "The paradox of knowledge is that the more you know, the more you realize you don't know.",
  "Between stimulus and response there is a space. In that space is our power to choose.",
  "What you seek is seeking you.",
  "The quieter you become, the more you can hear.",
  "We are not human beings having a spiritual experience. We are spiritual beings having a human experience.",
  "The eye through which I see God is the same eye through which God sees me.",
  "To know that you do not know is the best. To think you know when you do not is a disease.",
  "When you realize nothing is lacking, the whole world belongs to you.",
  "The truth you believe and cling to makes you unavailable to hear anything new.",
  "Empty yourself of everything. Let the mind rest at peace.",
  "Know thyself, and thou shalt know the universe and God.",
  "All is flux, nothing stays still.",
  "The unexamined life is not worth living.",
  "That which is seen is opposite to that which sees.",
  "In the depth of winter, I finally learned that within me there lay an invincible summer.",
  "You are not a drop in the ocean. You are the entire ocean in a drop.",
  "Be still and know.",
  "The map is not the territory.",
  "Consciousness is the fundamental thing in existence.",
  "We shall not cease from exploration, and the end of all our exploring will be to arrive where we started and know the place for the first time.",
  "The opposite of a correct statement is a false statement. But the opposite of a profound truth may well be another profound truth.",
  "Reality is merely an illusion, albeit a very persistent one.",
  "The eternal mystery of the world is its comprehensibility.",
  "Those who know do not speak. Those who speak do not know.",
  "The day you teach the child the name of the bird, the child will never see that bird again.",
];

const IMAGE_APIS = [
  { name: "nature", url: "https://source.unsplash.com/800x600/?nature" },
  { name: "art", url: "https://source.unsplash.com/800x600/?art" },
  { name: "photography", url: "https://source.unsplash.com/800x600/?photography" },
  { name: "space", url: "https://source.unsplash.com/800x600/?space,astronomy" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("email");

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: "No subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get random quote
    const randomQuote = ESOTERIC_QUOTES[Math.floor(Math.random() * ESOTERIC_QUOTES.length)];
    
    // Get random image API
    const randomImageApi = IMAGE_APIS[Math.floor(Math.random() * IMAGE_APIS.length)];
    const imageUrl = randomImageApi.url;

    // Send emails
    for (const subscriber of subscribers) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [subscriber.email],
        subject: "—",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="margin: 0; padding: 0; background-color: #000000; font-family: monospace;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <img src="${imageUrl}" alt="" style="width: 100%; height: auto; display: block; margin-bottom: 40px;" />
                <p style="color: #ffffff; font-size: 14px; line-height: 1.8; margin: 0; text-align: center; letter-spacing: 0.05em;">
                  ${randomQuote}
                </p>
              </div>
            </body>
          </html>
        `,
      });
    }

    return new Response(
      JSON.stringify({ message: `Sent to ${subscribers.length} subscribers` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
