export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "scheduled":
      return "bg-blue-500";
    case "completed":
      return "bg-gray-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};
