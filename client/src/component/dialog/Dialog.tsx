interface Props {
  title: string;
  open: boolean;
  message: string;
  children?: React.ReactNode;
}
export function Dialog({ title, open, message, children }: Props) {
  return (
    <div
      className={`fixed bg-white shadow-2xl border border-gray-400 w-5/6 min-h-[8rem] h-[8rem] bottom-[6rem] right-10 lg:w-[38.5%] lg:bottom-6 lg:right-9 z-20 rounded-md px-10 py-5 ${
        open ? "animate-fadeIn" : "animate-fadeOut"
      }`}
    >
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      <span className="text-gray-800 mb-4 text-sm font-medium">{message}</span>
      {children}
      <div className="bg-gradient-to-r from-gray-300 to-orange-400 w-full h-1 rounded-sm mt-4 animate-pulse duration-100"></div>
    </div>
  );
}
