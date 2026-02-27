export default async function DashboardPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your secure secrets manager
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-accent/50 text-sm p-4 rounded-lg border">
          <p className="font-medium mb-1">Getting Started</p>
          <p className="text-muted-foreground">
            Your dashboard is ready. Projects and environment variables will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
