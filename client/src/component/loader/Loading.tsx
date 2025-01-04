import "./loading.css";
export const Loading = ({ className }: { className?: string }) => {
  return (
    <>
      <div
        className={`absolute h-full w-full flex items-center justify-center bg-[rgba(255,255,255,0.6)] ${className}`}
      >
        <div>
          <div className="loader"></div>
        </div>
      </div>
    </>
  );
};
