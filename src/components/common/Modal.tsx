// Lightweight in-page confirm dialog (native confirm() is avoided so the
// app's own styling/testing stays consistent).
interface ConfirmModalProps {
  messageLines: string[];
  onConfirm: () => void;
  onCancel: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
}

export function ConfirmModal({ messageLines, onConfirm, onCancel, cancelLabel, confirmLabel }: ConfirmModalProps) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-box">
        <div className="modal-message">
          {messageLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={onCancel}>
            {cancelLabel ?? "取消 Cancel"}
          </button>
          <button className="primary-btn danger-btn" onClick={onConfirm}>
            {confirmLabel ?? "确定返回 Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
