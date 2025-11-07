
// Error message component
export default function ErrorMessage({ 
  title = "Error", 
  message = "Ha ocurrido un error inesperado",
  onRetry = null 
}) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-3xl mb-3">⚠️</div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          {title}
        </h3>
        <p className="text-red-700 mb-4 text-sm">
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
