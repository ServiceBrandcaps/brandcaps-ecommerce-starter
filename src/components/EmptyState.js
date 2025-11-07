
// Empty state component
export default function EmptyState({
  icon = "📦",
  title = "No hay elementos",
  message = "No se encontraron elementos para mostrar",
  action = null
}) {
  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        {action && action}
      </div>
    </div>
  );
}
