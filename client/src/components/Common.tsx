import type { ReactNode } from "react";
import type { Banner } from "../appTypes";

export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <span className="section-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function ToastBanner({ banner }: { banner: Banner }) {
  if (!banner) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={banner.type === "success" ? "toast-banner success" : "toast-banner error"}
      role="status"
    >
      {banner.text}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  cancelLabel,
  danger = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="confirm-backdrop" role="presentation" onClick={onCancel}>
      <article
        aria-modal="true"
        className="confirm-card"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="section-eyebrow">Confirm</span>
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="confirm-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={danger ? "primary-button danger" : "primary-button"}
            type="button"
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </button>
        </div>
      </article>
    </div>
  );
}
