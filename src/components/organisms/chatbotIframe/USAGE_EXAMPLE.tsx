// EXAMPLE: How to use useChatbotDatadogStatus in ChatbotIframe component

import { useEffect } from "react";
import { useChatbotDatadogStatus } from "@hooks";
import { DatadogUtils } from "@src/utilities";

export const ChatbotIframeWithDatadogVerification = () => {
  const chatbotDatadog = useChatbotDatadogStatus();

  // Verify chatbot Datadog is ready and sessions match
  useEffect(() => {
    if (chatbotDatadog.isReady) {
      console.log("[ChatbotIframe] ✅ Chatbot Datadog confirmed ready:", {
        sessionId: chatbotDatadog.sessionId,
        service: chatbotDatadog.service,
        timestamp: chatbotDatadog.timestamp,
      });

      // Optional: Verify unified session
      const parentSessionId = DatadogUtils.getSessionId();
      if (parentSessionId && chatbotDatadog.sessionId) {
        if (parentSessionId === chatbotDatadog.sessionId) {
          console.log("[ChatbotIframe] ✅ UNIFIED SESSION CONFIRMED");
          console.log("  Parent & Chatbot sharing session:", parentSessionId);
        } else {
          console.warn("[ChatbotIframe] ⚠️ SEPARATE SESSIONS DETECTED");
          console.log("  Parent session:", parentSessionId);
          console.log("  Chatbot session:", chatbotDatadog.sessionId);
          console.warn("  This means cookie sharing failed - check cookies!");
        }
      }

      // Optional: Send to analytics
      if (window.analytics) {
        window.analytics.track("chatbot_datadog_ready", {
          chatbot_session_id: chatbotDatadog.sessionId,
          sessions_unified: parentSessionId === chatbotDatadog.sessionId,
        });
      }
    }
  }, [chatbotDatadog.isReady, chatbotDatadog.sessionId]);

  return (
    <div className="relative">
      {/* Your iframe content */}

      {/* Optional: Dev-only visual indicator */}
      {process.env.NODE_ENV !== "production" && (
        <div className="absolute top-2 right-2 z-50 rounded bg-black/70 px-2 py-1 text-xs text-white">
          {chatbotDatadog.isReady ? (
            <span className="text-green-400">
              🟢 Datadog Ready ({chatbotDatadog.sessionId?.substring(0, 8)}...)
            </span>
          ) : (
            <span className="text-yellow-400">🟡 Initializing Datadog...</span>
          )}
        </div>
      )}
    </div>
  );
};

// ALTERNATIVE: Just log when ready (minimal approach)
export const MinimalExample = () => {
  const chatbotDatadog = useChatbotDatadogStatus();

  useEffect(() => {
    if (chatbotDatadog.isReady) {
      console.log("✅ Chatbot Datadog ready!");
    }
  }, [chatbotDatadog.isReady]);

  return <div>{/* Your content */}</div>;
};

// ALTERNATIVE: Wait for ready state before showing content
export const WaitForDatadogExample = () => {
  const chatbotDatadog = useChatbotDatadogStatus();

  if (!chatbotDatadog.isReady) {
    return <div>Loading chatbot tracking...</div>;
  }

  return <div>Chatbot ready with session: {chatbotDatadog.sessionId}</div>;
};
