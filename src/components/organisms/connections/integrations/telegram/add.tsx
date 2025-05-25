import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, SecretInput, ErrorMessage, SuccessMessage, Spinner } from "@components/atoms";

interface TelegramIntegrationAddFormProps {
  connectionId?: string;
  triggerParentFormSubmit: () => void;
  type?: string;
}

export const TelegramIntegrationAddForm: React.FC<TelegramIntegrationAddFormProps> = ({
  connectionId,
  triggerParentFormSubmit,
  type,
}) => {
  const { t } = useTranslation("integrations");
  const [botToken, setBotToken] = useState("");
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateToken = async (token: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setBotUsername(null);
    try {
      const res = await fetch("/api/integrations/telegram/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_token: token }),
      });
      if (!res.ok) throw new Error("Invalid response from server");
      const data = await res.json();
      if (data.username) {
        setBotUsername(data.username);
        setSuccess(t("telegram.botValidated", { username: data.username }));
      } else {
        throw new Error(data.error || t("telegram.invalidBotToken"));
      }
    } catch (e: any) {
      setError(e.message || t("telegram.validationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/integrations/telegram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_token: botToken }),
      });
      if (!res.ok) throw new Error(t("telegram.connectionFailed"));
      setSuccess(t("telegram.connected"));
      setBotUsername(null);
      setBotToken("");
      triggerParentFormSubmit();
    } catch (e: any) {
      setError(e.message || t("telegram.connectionFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleConnect}>
      <SecretInput
        label={t("telegram.botToken")}
        placeholder={t("telegram.enterBotToken")}
        value={botToken}
        onChange={e => setBotToken(e.target.value)}
        disabled={!!connectionId || loading}
        isRequired
      />
      <div className="flex gap-4 items-center">
        <Button
          type="button"
          onClick={() => validateToken(botToken)}
          disabled={!botToken || loading}
        >
          {t("telegram.validate")}
        </Button>
        <Button
          type="submit"
          disabled={!botUsername || loading}
          variant="primary"
        >
          {t("telegram.connect")}
        </Button>
        {loading && <Spinner size="sm" />}
      </div>
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </form>
  );
};

export default TelegramIntegrationAddForm; 