import { useEffect, useMemo, useState } from "react";

import { preloadRewardedAd, getRewardedAdSnapshot, showRewardedAd, subscribeRewardedAd } from "@/core/ads/rewarded";
import { getRemainingQuoteCount } from "@/core/quoteEngine";
import type { QuoteView } from "@/core/types";

type ClaimResult = "success" | "already-claimed" | "exhausted";

export function useOneMoreGate({
  extraQuote,
  claimExtraQuote,
  onExhausted,
}: {
  extraQuote: QuoteView | null;
  claimExtraQuote: () => Promise<ClaimResult>;
  onExhausted: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState(getRewardedAdSnapshot());

  useEffect(() => {
    void preloadRewardedAd();
    return subscribeRewardedAd(setSnapshot);
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = setTimeout(() => setToastMessage(null), 2400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const modalStatus = useMemo<"loading" | "ready" | "error">(() => {
    if (snapshot.status === "ready") {
      return "ready";
    }

    if (snapshot.status === "disabled" || snapshot.status === "error") {
      return "error";
    }

    return "loading";
  }, [snapshot.status]);

  const handleOneMorePress = async () => {
    if (extraQuote) {
      setToastMessage("Already unlocked today.");
      return;
    }

    const remaining = await getRemainingQuoteCount();
    if (remaining <= 0) {
      onExhausted();
      return;
    }

    setIsOpen(true);
    void preloadRewardedAd();
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    setIsOpen(false);
  };

  const handleWatchAd = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const result = await showRewardedAd();

    if (result === "reward-earned") {
      const claimResult = await claimExtraQuote();
      setIsSubmitting(false);
      setIsOpen(false);

      if (claimResult === "exhausted") {
        onExhausted();
        return;
      }

      if (claimResult === "already-claimed") {
        setToastMessage("Already unlocked today.");
        return;
      }

      setToastMessage("Unlocked one more quote.");
      return;
    }

    setIsSubmitting(false);
    setIsOpen(false);

    if (result === "error" || result === "not-ready") {
      setToastMessage("A short ad is unavailable right now.");
    }
  };

  return {
    isAlreadyUnlocked: Boolean(extraQuote),
    isOpen,
    isSubmitting,
    modalStatus,
    toastMessage,
    handleOneMorePress,
    handleClose,
    handleWatchAd,
  };
}
