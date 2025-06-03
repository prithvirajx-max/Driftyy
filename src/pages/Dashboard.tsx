import { useQuery } from "@tanstack/react-query";

const fetchUsers = async () => {
  const res = await fetch("http://localhost:3000/api/users");
  return res.json();
};

export default function Dashboard() {
  const { data: users, isLoading } = useQuery(["users"], fetchUsers);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <ul className="mt-4">
        {users?.map((user) => (
          <li key={user.id} className="py-2">
            {user.name} (Age: {user.age})
          </li>
        ))}
      </ul>
    </div>
  );
}