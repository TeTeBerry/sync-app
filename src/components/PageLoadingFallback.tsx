import "./PageLoadingFallback.scss";

type PageLoadingFallbackProps = {
  /** Reserve vertical space to reduce layout shift */
  minHeight?: number;
};

export default function PageLoadingFallback({
  minHeight = 120,
}: PageLoadingFallbackProps) {
  return (
    <div
      className="s-page-loading"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="s-page-loading__dot" />
      <span className="s-page-loading__dot" />
      <span className="s-page-loading__dot" />
    </div>
  );
}
