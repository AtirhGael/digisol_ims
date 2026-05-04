import { type SimpleTask } from "../../Types/task";

interface TaskComponentProps {
  title: string;
  tasks: SimpleTask[];
}

const TaskComponent = ({ title, tasks }: TaskComponentProps) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <h2 className="font-semibold mb-4">
        {title}
      </h2>

      <ul className="space-y-2">
        {tasks?.map((task) => (
          <li
            key={task.id}
            className="flex justify-between border px-4 py-2 rounded-md"
          >
            <span>{task.title}</span>
            <span className="text-sm text-gray-500">
              {task.status.replace("_", " ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskComponent;