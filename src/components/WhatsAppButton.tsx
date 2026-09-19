import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "../data/catalog";
import { useInquiry } from "./Inquiry";

export function WhatsAppButton() {
  const { open } = useInquiry();
  return (
    <div className="fixed bottom-5 left-5 z-[60] flex flex-col items-start gap-2 sm:left-auto sm:right-5 sm:items-end">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 bg-forest px-3 py-3 font-medium text-ivory shadow-lg hover:bg-charcoal sm:px-4"
      >
        <MessageCircle size={18} />
        <span className="hidden font-mono text-[11px] tracking-[0.16em] uppercase sm:inline">WhatsApp</span>
      </a>
      <button
        type="button"
        onClick={() => open({ title: "Conversation" })}
        className="hidden bg-sand px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-forest hover:bg-ivory sm:inline-flex"
      >
        Inquire
      </button>
    </div>
  );
}
