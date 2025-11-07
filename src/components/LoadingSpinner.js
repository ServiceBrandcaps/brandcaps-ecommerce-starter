
// Loading spinner component
export default function LoadingSpinner({ size = "md", text = null }) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4"
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Cargando"
      />
      {text && (
        <p className="mt-3 text-gray-600 text-sm">{text}</p>
      )}
    </div>
  );
}
