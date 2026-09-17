export default function NoAccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-4">
          You've signed in, but your account isn't assigned to a ProduceTrack group.
        </p>
        <p className="text-gray-500 text-sm mb-2">
          Please contact IT to be added to one of the following:
        </p>
        <ul className="text-left text-sm text-gray-600 mb-4 space-y-1">
          <li>• <strong>Admins:</strong> ProduceTrack-Admins group</li>
          <li>• <strong>Employees:</strong> ProduceTrack-Employees group</li>
          <li>• <strong>Producers:</strong> numeric email (e.g., 1552@ghcitrus.com)</li>
        </ul>
        <a
          href="/api/auth/signout"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign Out
        </a>
      </div>
    </div>
  );
}